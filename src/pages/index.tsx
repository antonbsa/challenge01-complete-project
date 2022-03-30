import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';
import Link from 'next/link';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function organizePrismicResponse(response) {
  return response.results.map((post) => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

}

export default function Home({ postsPagination }: HomeProps) {
  const { next_page, results } = postsPagination;

  const [posts, setPosts] = useState(results);
  const [nextPageUrl, setNextPageUrl] = useState(next_page);

  async function handleNextPosts() {
    const data = await fetch(nextPageUrl).then(resp => resp.json());
    const newPosts = organizePrismicResponse(data);

    setNextPageUrl(data.next_page);
    setPosts([
      ...posts,
      ...newPosts,
    ]);
  }

  return (
    <div className={styles.container}>
      {posts.map(post => (
        <Link key={post.uid} href={`post/${post.uid}`}>
          <div className={styles.post}>
            <span className={styles.title}>
              {post.data.title}
            </span>
            <span className={styles.subtitle}>
              {post.data.subtitle}
            </span>
            <div className={styles.footer}>
              <div>
                <FiCalendar size={20} />
                <span>{format(new Date(post.first_publication_date), 'dd MMM yyy', { locale: ptBR })}</span>
              </div>
              <div>
                <FiUser size={20} />
                <span>{post.data.author}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
      {!!nextPageUrl && (
        <div className={styles.loadMorePostsButton}>
          <button onClick={handleNextPosts}>
            Carregar mais posts
          </button>
        </div>
      )}
    </div>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.first_publication_date', 'post.author'],
    pageSize: 5,
  });

  const results = organizePrismicResponse(postsResponse);

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      }
    }
  }
};

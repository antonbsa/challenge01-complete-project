import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  posts: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { next_page, posts } = postsPagination;

  return (
    <div className={styles.container}>
      {posts.map(post => (
        <div key={post.uid} className={styles.post}>
          <span className={styles.title}>
            {post.data.title}
          </span>
          <span className={styles.subtitle}>
            {post.data.subtitle}
          </span>
          <div className={styles.footer}>
            <div>
              <FiCalendar size={20} />
              <span>{post.first_publication_date}</span>
            </div>
            <div>
              <FiUser size={20} />
              <span>{post.data.author}</span>
            </div>
          </div>
        </div>
      ))}
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

  const posts = postsResponse.results.map((post) => {
    return {
      uid: post.uid,
      first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyy', { locale: ptBR }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: '',
        posts,
      }
    }
  }
};

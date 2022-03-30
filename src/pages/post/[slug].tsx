import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';


import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const {
    first_publication_date,
    data,
  } = post;

  const router = useRouter();
  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  const wordsCount = data.content.reduce((sum, cur) => {
    sum += cur.heading.split(' ').length;
    sum += cur.body.reduce((prev, cur) => {
      prev += cur.text.split(' ').length;
      return prev;
    }, 0)
    return sum;
  }, 0);

  const readTime = (wordsCount / 150).toFixed();

  return (
    <div className={styles.container}>
      <img src={data.banner.url} alt="banner" />
      <div className={styles.post}>
        <div className={styles.header}>
          <span className={styles.title}>
            {data.title}
          </span>
          <div className={styles.subtitle}>
            <div>
              <FiCalendar size={20} />
              <span>
                {format(new Date(first_publication_date), 'dd MMM yyy', { locale: ptBR })}
              </span>
            </div>
            <div>
              <FiUser size={20} />
              <span>
                {data.author}
              </span>
            </div>
            <div>
              <FiClock size={20} />
              <span>
                {readTime} min
              </span>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {data.content.map(e => (
            <div key={e.heading}>
              <div
                className={styles.heading}
                dangerouslySetInnerHTML={{ __html: e.heading }}
              />
              <div
                className={styles.body}
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(e.body) }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('');

  const staticPostsPaths = posts.results.slice(0, 2).map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })

  return {
    paths: staticPostsPaths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(paragraph => {
        return {
          heading: paragraph.heading,
          body: paragraph.body,
        }
      }),
    }
  }

  return {
    props: {
      post,
    }
  }
};

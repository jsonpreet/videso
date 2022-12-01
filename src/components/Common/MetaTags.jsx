import { APP } from '@utils/constants'
import Head from 'next/head'
import { useRouter } from 'next/router'

const MetaTags = (props) => {
  const { description, title, image } = props
  const router = useRouter()

  const meta = {
    title: title ? `${title} - ${APP.Name}` : APP.Name,
    description: description ?? APP.Description,
    image: image ?? `${APP.URL}/meta.png`,
    type: 'website'
  }

  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="robots" content="follow, index" />
      <meta content={meta.description} name="description" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <link rel="icon" type="image/x-icon" href={`${APP.URL}/favicon.ico`} />
      <link rel="canonical" href={`${APP.URL}${router.asPath}`} />
      <meta property="og:url" content={`${APP.URL}${router.asPath}`}/>
      <meta property="og:type" content={meta.type} />
      <meta property="og:site_name" content={APP.Name} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:image:width" content="1200"/>
      <meta property="og:image:height" content="630"/>
      <meta property="og:image:type" content="image/png"/>
      <meta property="og:image:alt" content={meta.description} />
      <meta property="twitter:url" content={`${APP.URL}${router.asPath}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@VidesoApp" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta property="twitter:image" content={meta.image} />
      <meta property="twitter:creator" content='@VidesoApp' />
    </Head>
  )
}

export default MetaTags
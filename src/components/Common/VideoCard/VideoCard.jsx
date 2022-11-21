import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Deso from 'deso-protocol'
import ThumbnailOverlays from '../ThumbnailOverlays'
import IsVerified from '../IsVerified'
import { getThumbDuration, timeNow } from '@app/utils/functions'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import VideoOptions from './VideoOptions'
import axios from 'axios'
import { getPlaybackIdFromUrl } from '@app/utils/functions/getVideoUrl'
import { getVideoThumbnail } from '@app/utils/functions/getVideoThumbnail'
import { getProfilePicture } from '@app/utils/functions/getProfilePicture'
import { getVideoTitle } from '@app/utils/functions/getVideoTitle'
import ShareModal from '../ShareModal'
import { DESO_CONFIG } from '@app/utils/constants'
import Tooltip from '@app/components/UIElements/Tooltip'
import logger from '@app/utils/logger'
import { isBrowser } from 'react-device-detect'


const VideoCard = ({ video, userProfile }) => {
  const [showShare, setShowShare] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [videoData, setVideoData] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('/default-black.jpg')
  const [extraData, setExtraData] = useState('')

  useEffect(() => {
    const deso = new Deso(DESO_CONFIG)
    const getVideoData = async () => {
      try {
        const videoID = getPlaybackIdFromUrl(video);
        const request = {
          "videoId": videoID
        };
        const videoData = await deso.media.getVideoStatus(request)
        setVideoData(videoData.data)
      } catch (error) {
        logger.error(video.PostHashHex, error)
      }
    }
    if (video.VideoURLs[0] !== null) {
      getVideoData()
    }
      setExtraData(video.ExtraData)
  }, [video])

  useEffect(() => {
    const getThumbnail = async () => {
        try {
          const duration = getThumbDuration(videoData.Duration);
          const url = getVideoThumbnail(video, duration);
            //setThumbnailUrl(url)
          await axios.get(url, { responseType: 'blob' }).then((res) => {
            
            setThumbnailUrl(URL.createObjectURL(res.data))
          })
        } catch (error) {
          logger.error(video.PostHashHex, error)
      }
    }
    if (videoData) {
      getThumbnail()
    }
  }, [videoData, video])

  return (
    <div className="group">
      {video.IsHidden ? (
        <div className="grid h-full place-items-center">
          <span className="text-xs">Video Hidden by User</span>
        </div>
      ) : (
          <>
          <ShareModal video={video} show={showShare} setShowShare={setShowShare} />
          {/* <ReportModal
            video={video}
            show={showReport}
            setShowReport={setShowReport}
          /> */}
          <Link href={`/watch/${video.PostHashHex}`}>
            <div className="relative rounded-none md:rounded-xl aspect-w-16 overflow-hidden aspect-h-9">
                <LazyLoadImage
                  delayTime={1000}
                  className={clsx(
                  'object-center bg-gray-100 dark:bg-gray-900 w-full h-full rounded-none md:rounded-xl lg:w-full lg:h-full object-cover'
                  )}
                  alt={`Video by @${userProfile.Username}`}
                  wrapperClassName='w-full'
                  effect="blur"
                  placeholderSrc='https://placekitten.com/360/220'
                  src={thumbnailUrl}
              />
              <ThumbnailOverlays video={video} data={videoData} />
            </div>
          </Link>
          <div className="p-2">
            <div className="flex items-start space-x-2.5">
              <Link href={`/@${userProfile.Username}`} className="flex-none mt-0.5">
                <img
                  className="w-9 h-9 rounded-full"
                  src={getProfilePicture(userProfile)}
                  alt={`${userProfile.Username} Picture`}
                  draggable={false}
                />
              </Link>
              <div className="grid flex-1">
                <div className='flex w-full items-start justify-between '>
                  <div className="flex flex-col w-full items-start pr-2 justify-between min-w-0">
                    <Link
                      href={`/watch/${video.PostHashHex}`}
                      className="text-[15px] font-medium line-clamp-2 break-words"
                      >
                        {getVideoTitle(video, userProfile)}
                    </Link>
                    <Link
                      href={`/@${userProfile.Username}`}
                      className="flex w-fit items-center space-x-1.5 text-[14px] hover:opacity-100 opacity-70"
                    >
                        {isBrowser ? <Tooltip placement='top' contentClass='text-[12px]' title={userProfile.Username}><span>{userProfile.Username}</span></Tooltip> : <span>{userProfile.Username}</span>}
                      {userProfile.IsVerified ? <Tooltip placement='top' contentClass='text-[12px]' title='Verified'><span><IsVerified size="xs" /></span></Tooltip> : null}
                    </Link>
                    <div className="flex overflow-hidden text-[13px] opacity-70">
                      <span className="whitespace-nowrap">
                        {video.LikeCount} likes
                      </span>
                      <span className="middot" />
                        <span className="whitespace-nowrap">
                          {timeNow(video.TimestampNanos)}
                        </span>
                    </div>
                  </div>
                  <VideoOptions
                    video={video}
                    setShowShare={setShowShare}
                    setShowReport={setShowReport}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default VideoCard
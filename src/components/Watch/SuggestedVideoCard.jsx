import { getThumbDuration, timeNow } from '@app/utils/functions'
import { getVideoThumbnail } from '@app/utils/functions/getVideoThumbnail'
import { getVideoTitle } from '@app/utils/functions/getVideoTitle'
import { getPlaybackIdFromUrl } from '@app/utils/functions/getVideoUrl'
import IsVerified from '@components/Common/IsVerified'
import clsx from 'clsx'
import Deso from 'deso-protocol'
import Link from 'next/link'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import ThumbnailOverlays from '../Common/ThumbnailOverlays'
import VideoOptions from '../Common/VideoCard/VideoOptions'

const SuggestedVideoCard = ({ video }) => {
    const [showShare, setShowShare] = useState(false)
    const [showReport, setShowReport] = useState(false)
    const [videoData, setVideoData] = useState('')
    const [thumbnailUrl, setThumbnailUrl] = useState('')
    const [userProfile, setUserProfile] = useState('')
    const [extraData, setExtraData] = useState('')
    const [error, setError] = useState(false)

    useEffect(() => {
        const deso = new Deso()
        const getVideoData = async () => {
        try {
            const videoID = getPlaybackIdFromUrl(video);
            const request = {
                "videoId": videoID
            };
            const videoData = await deso.media.getVideoStatus(request)
            setVideoData(videoData.data)
            try {
                const duration = getThumbDuration(videoData.data.Duration);
                const url = getVideoThumbnail(video, duration);
                await axios.get(url, { responseType: 'blob' }).then((res) => {
                    setThumbnailUrl(URL.createObjectURL(res.data))
                })
            } catch (error) {
                setError(true)
             console.log('Video Thumbnail:', video.PostHashHex, error)
            }
        } catch (error) {
            setError(true)
            console.log('Video Status:', video.PostHashHex, error)
        }
        }
        if (video.VideoURLs[0] !== null) {
            getVideoData()
        }
        setUserProfile(video.ProfileEntryResponse)
        setExtraData(video.ExtraData)
    }, [video])   
  
    return (
        <div className="flex w-full justify-between group" data-id={video.PostHashHex} data-duration={videoData.Duration}>
            <div className="flex md:flex-row flex-col w-full">
                <div className="flex-none overflow-hidden rounded-none md:rounded-xl w-full md:w-44">
                    <Link
                        href={`/watch/${video.PostHashHex}`}
                        className="rounded-xl cursor-pointer"
                    >
                        <div className="relative">
                            <LazyLoadImage
                                delayTime={1000}
                                className={clsx(
                                'bg-gray-100 rounded-none md:rounded-xl dark:bg-gray-900 object-cover object-center h-52 md:h-24 w-full'
                                )}
                                alt={`Video by @${userProfile.Username}`}
                                wrapperClassName='w-full'
                                effect="blur"
                                placeholderSrc='https://placekitten.com/144/80'
                                src={thumbnailUrl}
                            />
                            <ThumbnailOverlays video={video} data={videoData} />
                        </div>
                    </Link>
                </div>
                <div className="px-3 py-3 md:py-0 md:px-2.5 flex flex-row md:justify-between w-full">
                    <div className="flex flex-col md:w-auto w-full items-start pb-1">
                        <div className="break-words w-full md:mb-0 mb-1 overflow-hidden">
                            <Link
                                href={`/watch/${video.PostHashHex}`}
                                className="text-sm font-medium line-clamp-1"
                            >
                                <span className="flex line-clamp-2">
                                    {getVideoTitle(video)}
                                </span>
                            </Link>
                        </div>
                        <div className='flex md:flex-col flex-row md:items-start items-center'>
                            <div className="truncate">
                                <Link
                                    href={`/${userProfile.Username}`}
                                    className="text-sm truncate hover:opacity-100 opacity-80"
                                >
                                    <div className="flex items-center space-x-0.5">
                                        <span>{userProfile.Username}</span>
                                        {userProfile.IsVerified ? <IsVerified size="xs" /> : null}
                                    </div>
                                </Link>
                            </div>
                            <span className="middot md:hidden inline-flex" />
                            <div className="flex truncate items-center text-xs opacity-80 mt-0.5">
                                <span className="whitespace-nowrap">
                                    {video.LikeCount} likes
                                </span>
                                <span className="middot" />
                                <span>{timeNow(video.TimestampNanos)}</span>
                            </div>
                        </div>
                    </div>
                    <VideoOptions
                        setShowReport={setShowReport}
                        video={video}
                        isSuggested={true}
                        setShowShare={setShowShare}
                    />
                </div>
            </div>
        </div>
    )
}

export default SuggestedVideoCard
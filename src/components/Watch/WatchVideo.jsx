import MetaTags from '@components/Common/MetaTags'
import { useRouter } from 'next/router'
import Custom500 from 'pages/404'
import Custom404 from 'pages/500'
import React, { useEffect, useState } from 'react'
import { WatchVideoShimmer } from '@components/Shimmers/WatchVideoShimmer'
import usePersistStore from '@app/store/persist'
import useAppStore from '@app/store/app'
import { getPlaybackIdFromUrl } from '@app/utils/functions/getVideoUrl'
import axios from 'axios'
import AboutChannel from './AboutChannel'
import SuggestedVideos from './SuggestedVideos'
import Video from './Video'
import VideoComments from './VideoComments'
import Deso from 'deso-protocol'
import { getThumbDuration } from '@app/utils/functions'
import { getVideoThumbnail } from '@app/utils/functions/getVideoThumbnail'
import { getVideoTitle } from '@app/utils/functions/getVideoTitle'
import { FetchSinglePost, getSinglePost } from '@app/data/videos'
import { useQuery } from '@tanstack/react-query'

const WatchVideo = () => {
    const router = useRouter()
    const { id, t } = router.query
    const addToRecentlyWatched = usePersistStore((state) => state.addToRecentlyWatched)
    const selectedChannel = useAppStore((state) => state.selectedChannel)
    const setVideoWatchTime = useAppStore((state) => state.setVideoWatchTime)
    const [videoData, setVideoData] = useState('')
    const [thumbnailUrl, setThumbnailUrl] = useState('')
    const [loading, setLoading] = useState(true)
    const [posthash, setPosthash] = useState('')
    
    ///const { data: video, isLoading, isFetching, isFetched, error, isError } = FetchSinglePost({ id });

    const { isSuccess, isLoading, isError, error, refetch, isFetching, status, fetchStatus, data: video } = useQuery([['single-post', id], { id: id }], getSinglePost, { enabled: !!id, })

    useEffect(() => {
        const { id, t } = router.query
        if (id) {
            setPosthash(id)
        }
        if (t) {
            setVideoWatchTime(Number(t))
        }
    }, [router])

    console.log({isSuccess: isSuccess, isLoading: isLoading, isFetching: isFetching, isError: isError, 'video': id})

    useEffect(() => {
        const deso = new Deso()
        const getVideo = async () => {
            const videoID = getPlaybackIdFromUrl(video);
            // const request = {
            //     "videoId": videoID
            // };
            // const videoData = await deso.media.getVideoStatus(request)
            setVideoData({ id: videoID, data: null })
            try {
                //const duration = getThumbDuration(videoData.data.Duration);
                const url = getVideoThumbnail(video);
                await axios.get(url, { responseType: 'blob' }).then((res) => {
                    setThumbnailUrl(URL.createObjectURL(res.data))
                    setLoading(false)
                })
            } catch (error) {
                setLoading(false)
                console.log(video.PostHashHex, 'thumbnail', error)
            }
        }
        if (video && isSuccess) {
            addToRecentlyWatched(video)
            getVideo()
        }
    }, [video, isSuccess, addToRecentlyWatched])

    // useEffect(() => {
    //     setVideoWatchTime(Number(t))
    // }, [t, setVideoWatchTime])

    if (isError) {
        return <Custom500 />
    }
    if (loading || isFetching || !video) return <WatchVideoShimmer />
    return (
        <>
            <MetaTags title={video ? getVideoTitle(video) : 'Watch'} />
            {!isFetching && !loading && !isError && video ? (
                <div className="w-full">
                    <div className="flex md:pr-6 md:flex-1 flex-col space-y-4">
                        <Video videoData={videoData} video={video} poster={thumbnailUrl} />
                        <AboutChannel video={video} />
                        <VideoComments video={video} />
                    </div>
                    <div className="w-full md:min-w-[300px] md:max-w-[400px]">
                        <SuggestedVideos currentVideoId={video?.PostHashHex} />
                    </div>
                </div>
            ) : null}
        </>
    )
}

export default WatchVideo
import logger from '@app/utils/logger'
import ThumbnailsShimmer from '@app/components/Shimmers/ThumbnailsShimmer'
import { Loader } from '@components/UIElements/Loader'
import clsx from 'clsx'
import { BiImageAdd } from 'react-icons/bi'
import { generateVideoThumbnails } from '@app/utils/functions/generateVideoThumbnails'
import { getIsNSFW } from '@app/utils/functions/getIsNSFW'
import { getFileFromDataURL } from '@app/utils/functions/getFileFromDataURL'
import useAppStore from '@app/store/app'
import { useEffect, useState } from 'react'
import Deso from 'deso-protocol';
import { UploadImage } from '@app/data/image'
import usePersistStore from '@app/store/persist'
import * as tf from '@tensorflow/tfjs'
import * as nsfwjs from 'nsfwjs'

const DEFAULT_THUMBNAIL_INDEX = 0
export const THUMBNAIL_GENERATE_COUNT = 3

const VideoThumbnails = ({ label, afterUpload, file }) => {
    const {user} = usePersistStore()
    const [thumbnails, setThumbnails] = useState([])
    const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(-1)
    const setUploadedVideo = useAppStore((state) => state.setUploadedVideo)
    const uploadedVideo = useAppStore((state) => state.uploadedVideo)

    const uploadThumbnail = async (file) => {
        setUploadedVideo({ uploadingThumbnail: true })
        try {
            const deso = new Deso();
            const request = undefined;  
            const jwt = await deso.identity.getJwt(request);
            const response = await UploadImage(jwt, file, user.profile.PublicKeyBase58Check)
            afterUpload(response.data.ImageURL, file.type || 'image/jpeg')
            return response.data.ImageURL
        } catch (error) {
            console.log(error)
        } finally {
            setUploadedVideo({ uploadingThumbnail: false })
        }
    }

    const generateThumbnails = async (file) => {
        try {
            const thumbnailArray = await generateVideoThumbnails(
                file,
                THUMBNAIL_GENERATE_COUNT
            )
            const thumbnails = []
            thumbnailArray.forEach((t) => {
                thumbnails.push({ url: t, ipfsUrl: '', isNSFWThumbnail: false,type: 'image/jpeg' })
            })
            setThumbnails(thumbnails)
            //setSelectedThumbnailIndex(DEFAULT_THUMBNAIL_INDEX)
            // const imageFile = getFileFromDataURL( thumbnails[DEFAULT_THUMBNAIL_INDEX].url, 'thumbnail.jpeg')
            // const ipfsResult = await uploadThumbnail(imageFile)
            // setThumbnails(
            //     thumbnails.map((t, i) => {
            //         if (i === DEFAULT_THUMBNAIL_INDEX) t.ipfsUrl = ipfsResult
            //         return t
            //     })
            // )
        } catch (error) {
            logger.error('[Error Generate Thumbnails]', error)
        }
    }

    useEffect(() => {
        if (file)
            generateThumbnails(file).catch((error) =>
                logger.error('[Error Generate Thumbnails from File]', error)
            )
            return () => {
                setSelectedThumbnailIndex(-1)
                setThumbnails([])
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file])

    const checkNsfw = async (source) => {
        const img = document.createElement('img')
        img.src = source
        img.height = 200
        img.width = 400
        let predictions = []
        try {
            const model = await nsfwjs.load()
            predictions = await model?.classify(img, 3)
        } catch (error) {
            logger.error('[Error Check NSFW]', error)
        }
        return getIsNSFW(predictions)
    }

    const handleUpload = async (e) => {
        if (e.target.files?.length) {
            setSelectedThumbnailIndex(-1)
            const result = await uploadThumbnail(e.target.files[0])
            const preview = window.URL?.createObjectURL(e.target.files[0])
            const isNSFWThumbnail = await checkNsfw(preview)
            setUploadedVideo({ isNSFWThumbnail })
            setThumbnails([
                { url: preview, url: result, isNSFWThumbnail },
                ...thumbnails
            ])
            setSelectedThumbnailIndex(0)
        }
    }

    const onSelectThumbnail = async (index) => {
        setSelectedThumbnailIndex(index)
        if (thumbnails[index].ipfsUrl === '') {
            const file = getFileFromDataURL(thumbnails[index].url, 'thumbnail.jpeg')
            const ipfsResult = await uploadThumbnail(file)
            setThumbnails(
                thumbnails.map((t, i) => {
                    if (i === index) t.ipfsUrl = ipfsResult
                    return t
                })
            )
        } else {
            afterUpload(thumbnails[index].ipfsUrl, 'image/jpeg')
            setUploadedVideo({ isNSFWThumbnail: thumbnails[index]?.isNSFWThumbnail })
        }
    }

    return (
        <div className="w-full">
            {label && (
                <div className="flex items-center mb-1 space-x-1.5">
                    <div className="font-medium text-sm">
                        {label}
                    </div>
                </div>
            )}
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 place-items-start py-0.5 gap-3">
            <label
                htmlFor="chooseThumbnail"
                className="flex flex-col items-center justify-center flex-none w-full h-20 border-2 border-dotted border-gray-300 cursor-pointer max-w-32 rounded-md opacity-80 focus:outline-none dark:border-gray-700"
            >
                <input 
                    id="chooseThumbnail"
                    type="file"
                    accept=".png, .jpg, .jpeg"
                    className="hidden w-full"
                    onChange={handleUpload}
                />
                    <BiImageAdd size={21} className="flex-none mb-1" />
                <span className="tracking-wide text-[13px]">Upload thumbnail</span>
            </label>
            {!thumbnails.length && <ThumbnailsShimmer />}
                {thumbnails.map((thumbnail, idx) => {
                return (
                    <button
                        key={idx}
                        type="button"
                        disabled={
                            uploadedVideo.uploadingThumbnail &&
                            selectedThumbnailIndex === idx
                        }
                        onClick={() => onSelectThumbnail(idx)}
                        className={clsx(
                            'rounded-md flex w-full relative cursor-grab flex-none focus:outline-none',
                            {
                            'drop-shadow-2xl ring ring-brand2-500': selectedThumbnailIndex === idx,
                            'ring !ring-red-500': thumbnail.isNSFWThumbnail
                            }
                        )}
                    >
                    <img
                        className="object-cover w-full h-20 rounded-md"
                        src={thumbnail.url}
                        alt="thumbnail"
                        draggable={false}
                    />
                    {uploadedVideo.uploadingThumbnail &&
                        selectedThumbnailIndex === idx && (
                        <div className="absolute top-1 right-1">
                            <span>
                                <Loader size="sm" className="!text-white" />
                            </span>
                        </div>
                        )}
                    </button>
                )
            })}
        </div>
        {!uploadedVideo.thumbnail.length &&
        !uploadedVideo.uploadingThumbnail &&
        thumbnails.length ? (
            <p className="mt-2 text-xs font-medium text-red-500">
                Please choose a thumbnail
            </p>
        ) : null}
        </div>
    )
}

export default VideoThumbnails
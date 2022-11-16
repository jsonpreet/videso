import Head from 'next/head'
import Deso from 'deso-protocol'
import { useEffect, useState } from 'react'
import * as tus from "tus-js-client"

function UploadVideo() {
    const [deso, setDeso] = useState(null)
    const [file, setFile] = useState(null)
    const [mediaID, setMediaId] = useState(null)
    const [videoUrl, setVideoUrl] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const videoStreamInterval = null

    useEffect(() => {
        const deso = new Deso();
        setDeso(deso)
    }, [])

    // const uploadVideo = async () => {
    //   const request = undefined;
    //   const url = await deso.media.uploadVideo(request)
    //   console.log(url)
    // }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // const file = e.target.files[0]
        return new Promise((resolve, reject) => {
        if (file.size > 4 * (1024 * 1024 * 1024)) {
            this.globalVars._alertError("File is too large. Please choose a file less than 4GB");
            return;
        }
        let upload;
        let mediaId = "";
        const options = {
            endpoint: 'https://node.deso.org/api/v0/upload-video',
            chunkSize: 50 * 1024 * 1024, // Required a minimum chunk size of 5MB, here we use 50MB.
            uploadSize: file.size,
            onError: (error) => {
            console.log(error.message)
            upload.abort(true).then(() => {
                throw error;
            }).finally(reject);
            },
            onProgress: (bytesUploaded, bytesTotal) => {
            setUploadProgress(((bytesUploaded / bytesTotal) * 100).toFixed(2));
            },
            onSuccess: () => {
            // Construct the url for the video based on the videoId and use the iframe url.
            setVideoUrl(`https://iframe.videodelivery.net/${mediaId}`)
            setUploadProgress(100)
            pollForReadyToStream(resolve, mediaId);
            },
            onAfterResponse: (req, res) => {
            // The stream-media-id header is the video Id in Cloudflare's system that we'll need to locate the video for streaming.
            let mediaIdHeader = res.getHeader("stream-media-id");
            if (mediaIdHeader) {
                mediaId = mediaIdHeader;
                setMediaId(mediaIdHeader)
            }
            },
        };
        // Clear the interval used for polling cloudflare to check if a video is ready to stream.
        if (videoStreamInterval != null) {
            clearInterval(videoStreamInterval);
        }
        // Create and start the upload.
        upload = new tus.Upload(file, options);
        upload.start();
        });
    }


    const pollForReadyToStream = (onReadyToStream, mediaId) => {
        let attempts = 0;
        let numTries = 1200;
        let timeoutMillis = 500;
        const videoStreamInterval = setInterval(async () => {
        if (attempts >= numTries) {
            clearInterval(videoStreamInterval);
            return;
        }
        const request = {
            "videoId": mediaId
        };
        const response = await deso.media.getVideoStatus(request);
        if (response.status === 200 && response.data !== undefined){
            if (response.data.ReadyToStream) {
            console.log("Video is ready to stream");
            onReadyToStream();
            clearInterval(videoStreamInterval);
            return;
            }
            if (response.data.exitPolling) {
            console.log("Video is not ready to stream");
            clearInterval(videoStreamInterval);
            return;
            }
        }
        attempts++;
        }, timeoutMillis);
    }
    return (
        <>
        
            <form acceptCharset="UTF-8"
                    method="POST"
                    encType="multipart/form-data"
                    id="ajaxForm"
                    onSubmit={handleSubmit} className='flex flex-col space-y-6'>
            <input type="file" name="video" onChange={handleFileChange} />
            <button type="submit" className='bg-white text-black border-0 px-4 py-2 font-semibold'>Upload Video</button>
            {videoUrl && <div className='flex flex-col space-y-2'>
                <p className='text-white'>Video URL: {videoUrl}</p>
                <p className='text-white'>Video ID: {mediaID}</p>
            </div>}
            {uploadProgress > 0 && <p>{uploadProgress}%</p>}
            </form>
        </>
    )
}

export default UploadVideo
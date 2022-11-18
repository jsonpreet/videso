import MetaTags from '@components/Common/MetaTags'
//import Timeline from './Timeline'
import dynamic from "next/dynamic";
import { Suspense } from 'react';
import FullPageLoader from '../Common/FullPageLoader';
const Timeline = dynamic(() => import("./Timeline"), {
  suspense: true,
});
const Home = () => {
    return (
        <>
            <MetaTags />
            <div className="md:px-16">
                <Suspense fallback={<FullPageLoader/>}>
                    <Timeline />
                </Suspense>
            </div>
        </>
    )
}

export default Home
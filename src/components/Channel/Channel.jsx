import clsx from 'clsx';
import { Suspense, useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import { Router, useRouter } from 'next/router';
import Custom404 from '@app/pages/500';
import { Tab } from '@headlessui/react';
import { FetchProfile } from '@app/data/channel';
import MetaTags from '@app/components/Common/MetaTags'
import ChannelShimmer from '@app/components/Shimmers/ChannelShimmer';
import { Loader2 } from '@app/components/UIElements/Loader';
import { NoDataFound } from '@app/components/UIElements/NoDataFound';
import ChannelInfo from './Info';
import axios from 'axios';
import toast from 'react-hot-toast';
import usePersistStore from '@app/store/persist';
import Deso from 'deso-protocol';
import { DESO_CONFIG } from '@app/utils/constants';
import logger from '@app/utils/logger';
import { BsThreeDots, BsThreeDotsVertical } from 'react-icons/bs';
import DropMenu from '../UIElements/DropMenu';
import Link from 'next/link';
import { Button } from '../UIElements/Button';
import { FiFlag } from 'react-icons/fi';
import MoreTabsModal from '../Common/MoreTabsModal';

const ChannelVideos = dynamic(() => import("./Tabs/Videos"), {
  suspense: true,
});

const Stori = dynamic(() => import("./Tabs/Stori"), {
  suspense: true,
});

const Community = dynamic(() => import("./Community/Community"), {
  suspense: true,
});

const Channels = dynamic(() => import("./Tabs/Channels"), {
  suspense: true,
});

const About = dynamic(() => import("./Tabs/About"), {
  suspense: true,
});

const Channel = () => {
    const router = useRouter();
    const { query } = router;
    const { isLoggedIn, user } = usePersistStore();
    const [channelStats, setChannelStats] = useState(false)
    const [isLoading, setisLoading] = useState(true)
    const [follow, setFollow] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [selectedTab, setSelectedTab] = useState(0)
    const [followers, setFollowers] = useState(0)
    const [username, setUsername] = useState('')
    const [routeTab, setRouteTab] = useState('')
    const reader = isLoggedIn ? user.profile.PublicKeyBase58Check : '';
    const { data: channel, isError, error, isFetched } = FetchProfile(username);

    const channelTabs = {
        0: "Videos",
        1: "Stori",
        2: "Community",
        3: "Channels",
        4: "About",
    }

    const getDefaultTab = () => {
        if (routeTab) {
            return Object.keys(channelTabs).find(key => channelTabs[key].toLowerCase() === routeTab.toLowerCase());
        }
        return 0;
    }

    useEffect(() => {
        if (query.channel) {
            setUsername(query.channel.replace('@', ""));
        }
        if (query.tab) {
            setRouteTab(query.tab)
        }
    }, [query])

    useEffect(() => {
        const deso = new Deso(DESO_CONFIG);
        async function getFollowers() {
            try {
                const request = {
                    PublicKeyBase58Check: channel.PublicKeyBase58Check,
                    GetEntriesFollowingUsername: true
                };
                const response = await deso.social.getFollowsStateless(request);
                setFollowers(response.NumFollowers);
                setisLoading(false)
                    
            } catch (error) {
                logger.error(error);
                toast.error("Something went wrong!");
            }
        }
        
        async function checkFollowing() {
            const request = {
                PublicKeyBase58Check: reader,
                IsFollowingPublicKeyBase58Check: channel.PublicKeyBase58Check
            };
            try {
                const response = await deso.social.isFollowingPublicKey(request);
                setFollow(response.data.IsFollowing);
                setisLoading(false)

            } catch (error) {
                logger.error(error);
                toast.error("Something went wrong!");
            }
        }
        if (isFetched) {
            getFollowers()
            if (isLoggedIn) {
                checkFollowing()
            }
        }
    }, [isFetched, channel, isLoggedIn, reader])

    useEffect(() => {
        if (isFetched) {
            FetchProfileStats(channel.Username);
        }
    }, [isFetched, channel])

    
    const FetchProfileStats = async (username) => {
        const requestURL = 'https://desocialworld.com/microservice-enriched/v1/get-single-profile';
        try {
            await axios.post(requestURL, {
                Username: username,
            }).then(response => {
                const UserAge = response.data.Profile.UserAge;
                const UserGeo = response.data.Profile.UserGeo;
                const UserLanguages = response.data.Profile.UserLanguages;
                setChannelStats({ UserAge, UserGeo, UserLanguages })
            });
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong');
        }
    }

    const changeTab = (index) => {
        setSelectedTab(index);
        const tab = channelTabs[index].toLowerCase()
        router.replace(`/@${username}/${tab}`, `/@${username}/${tab}`, { shallow: true });
    }

    if (isError) {
        return <NoDataFound 
            isCenter
            withImage
            title="Something went wrong"
            description="We are unable to fetch the latest videos. Please try again later."
          />
    } 

    if(isFetched && !channel) return <Custom404 />

    if (isLoading) return <ChannelShimmer />

    const Loader = () => {
        return (
            <div className="flex items-center mt-20 justify-center">
                <Loader2 />
            </div>
        )
    }

    const TabItem = ({title,  isHidden = false}) => {
        return (
            <Tab
                className={({ selected }) =>
                    clsx(
                        'px-4 md:px-8 py-3 flex items-center tracking-wider text-sm space-x-2 border-b-[3px] uppercase font-medium focus:outline-none',
                        selected
                        ? 'border-gray-700 dark:border-gray-500 opacity-100'
                            : 'border-transparent hover:text-brand2-500 dark:hover:text-brand-500',
                        {
                            'md:block hidden': isHidden === true
                        }
                    )
                }
            >
                <span>{title}</span>
            </Tab>
        )
    }

    const TabButton = () => {
        return (
            <>
                <div className='md:hidden block'>
                    <Button
                        variant="none"
                        onClick={() => setShowModal(true)}
                        className='!p-0 w-10 h-10' 
                    >
                        <span className="flex items-center space-x-3">
                            <BsThreeDots size={26} />
                        </span>
                    </Button>
                </div>
            </>
        )
    }
    
    if (isFetched) {
        return (
            <>
                <MetaTags title={`${channel?.Username}`} />
                <div className="">
                    <ChannelInfo followers={followers} following={follow} channel={channel}/>
                    {channel && <MoreTabsModal username={channel.Username} show={showModal} setShowModal={setShowModal} />}
                    <Tab.Group as="div" className="w-full" defaultIndex={getDefaultTab()} onChange={index => changeTab(index)}>
                        <Tab.List className="border-b theme-border md:drop-shadow-none drop-shadow realtive mb-5">
                            <div className='flex md:justify-start max-w-7xl mx-auto'>
                                    <TabItem title="Videos" />
                                    <TabItem title="Stori" />
                                    <TabItem title="Community" />
                                    <TabItem isHidden={true} title="Channels" />
                                    <TabItem isHidden={true} title="About" />
                                    <TabButton/>
                            </div>
                        </Tab.List>
                        <Tab.Panels>
                            <Tab.Panel className="md:py-3 p-0 md:px-16 focus:outline-none">
                                <Suspense fallback={<Loader/>}>
                                    <ChannelVideos channel={channel} />
                                </Suspense>
                            </Tab.Panel>
                            <Tab.Panel className="md:py-3 p-0 px-4 md:px-16 focus:outline-none">
                                <Suspense fallback={<Loader/>}>
                                    <Stori channel={channel} />
                                </Suspense>
                            </Tab.Panel>
                            <Tab.Panel className="md:py-3 px-4 md:px-16 focus:outline-none">
                                <Suspense fallback={<Loader/>}>
                                    <Community channel={channel} />
                                </Suspense>
                            </Tab.Panel>
                            <Tab.Panel className="md:py-3 px-4 md:px-16 block focus:outline-none">
                                <Suspense fallback={<Loader/>}>
                                    <Channels channel={channel} />
                                </Suspense>
                            </Tab.Panel>
                            <Tab.Panel className="md:py-3 px-4 md:px-16 block focus:outline-none">
                                <Suspense fallback={<Loader/>}>
                                    <About stats={channelStats} channel={channel} />
                                </Suspense>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </>
        )
    }
}

export default Channel
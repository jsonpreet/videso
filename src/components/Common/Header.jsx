// import NewVideoTrigger from '@/components/Channel/NewVideoTrigger'
// import NotificationTrigger from '@/components/Notifications/NotificationTrigger'

import useAppStore from '@store/app'
import { HOME } from '@utils/paths'
import Link from 'next/link'
import { useState } from 'react'
import { Search } from '@components/Search'
import { Button } from '@components/UIElements/Button'
import { APP } from '@utils/constants'
import Image from 'next/image'
import ThemeSwitch from './ThemeSwitch'
import UserMenu from './UserMenu'
import usePersistStore from '@app/store/persist'



const Header = ({ className }) => {
  const hasNewNotification = useAppStore((state) => state.hasNewNotification)
  const isLoggedIn = usePersistStore((state) => state.isLoggedIn)
  const [loading, setLoading] = useState(false)
  const [showShowModal, setSearchModal] = useState(false)

  return (
    <div className='fixed items-center flex justify-between flex-row z-20 left-0 right-0 top-0 flex-shrink-0 header-glassy h-16 px-4'>
      <div className="w-56 flex md:justify-center py-4">
        <Link
          href={HOME}
          className="flex items-center justify-start pb-1 focus:outline-none"
        >
          <Image src='/videso.png' alt={APP.Name} height={35} width={31} />
          <span className='font-semibold font-oswald text-gray-700 dark:text-white text-2xl md:text-3xl ml-2'>{APP.Name}</span>
        </Link>
      </div>
      <Search />
      <div className="flex flex-row items-center justify-end space-x-3 md:w-56">
        {/* <button
          type="button"
          onClick={() => setSearchModal(true)}
          className="outline-none md:hidden"
        >
          <AiOutlineSearch className="text-lg" aria-hidden="true" />
        </button> */}
        {/* {selectedChannelId ? (
          <>
            <NotificationTrigger />
            <Link href={NOTIFICATIONS} className="relative p-1 md:hidden">
              <CgBell className="text-lg" />
              {hasNewNotification && (
                <span className="absolute flex w-1.5 h-1.5 bg-red-500 rounded-full top-0 right-0" />
              )}
            </Link>
            <NewVideoTrigger />
          </>
        ) : null} */}
        {isLoggedIn ? (
          <>
            <Button onClick={() => setLoading(!loading)} loading={loading}>
              Upload Video
            </Button>
          </>
        ) : <ThemeSwitch/>}
        <UserMenu/>
      </div>
    </div>
  )
}

export default Header
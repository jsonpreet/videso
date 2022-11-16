import { Menu, Transition } from '@headlessui/react'
import clsx from 'clsx'
import Link from 'next/link'
import { FC, Fragment, ReactElement, ReactNode } from 'react'

export const NextLink = ({ href, children, ...rest }) => (
  <Link href={href} {...rest}>
    {children}
  </Link>
)

const DropMenu = ({
  trigger,
  children,
  positionClassName,
  position = 'right'
}) => (
  <Menu as="div" className="relative">
    <Menu.Button as="div" className="flex cursor-pointer">
      {trigger}
    </Menu.Button>
    <Transition
      as={Fragment}
      enter="transition duration-200 ease-out"
      enterFrom="transform scale-95 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave="transition duration-75 ease-out"
      leaveFrom="transform scale-100 opacity-100"
      leaveTo="transform scale-95 opacity-0"
      className={clsx(
        'absolute z-10 outline-none ring-0 focus:outline-none focus:ring-0',
        {
          'right-0': position === 'right',
          'left-0': position === 'left',
          'bottom-0': position === 'bottom'
        },
        positionClassName
      )}
    >
      <Menu.Items className='outline-none ring-0 focus:outline-none focus:ring-0' static>{children}</Menu.Items>
    </Transition>
  </Menu>
)

export default DropMenu
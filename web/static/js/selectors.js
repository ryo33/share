import { isSameUser } from './utils.js'

export const infoSelector = ({ info }) => info

export const isLoadedSelector = ({ isLoaded }) => isLoaded
export const pageSelector = ({ page }) => page
export const redirectedPageSelector = ({ redirectedPage }) => redirectedPage
export const userSelector = ({ user }) => user
export const usersSelector = ({ users }) => users
export const followingSelector = ({ following }) => following
export const remoteFollowingSelector = ({ remoteFollowing }) => remoteFollowing
export const followersSelector = ({ followers }) => followers
export const favsSelector = ({ favs }) => favs
export const errorSelector = ({ error }) => error
export const windowFocusedSelector = ({ windowFocused }) => windowFocused
export const isTrustedImageUserFunctionSelector =
  ({ trustedImageUsers: users }) => user1 => users.some(
    user2 => isSameUser(user1, user2)
  )

// New post
export const newPostPageSelector = ({ newPostPage }) => newPostPage
export const editorPluginsSelector = ({ editorPlugins }) => editorPlugins
export const failedPostSelector = ({ failedPost }) => failedPost

// User
export const userPageSelector = ({ userPage }) => userPage

// Followers
export const followersPageSelector = ({ followersPage }) => followersPage

// Following
export const followingPageSelector = ({ followingPage }) => followingPage

// Mysteries
export const mysteriesPageSelector = ({ mysteriesPage }) => mysteriesPage

// Opened mysteries
export const openedMysteriesPageSelector = ({ openedMysteriesPage }) => openedMysteriesPage

// Post
export const postPageSelector = ({ postPage }) => postPage

// Public timeline
export const publicTimelineSelector = ({ publicTimeline }) => publicTimeline

// Timeline
export const timelineSelector = ({ timeline }) => timeline
export const followingServersSelector = ({ timeline: { remotes }}) => Object.keys(remotes)

// Notices
export const noticesCountSelctor = ({ notices: { noticed, favs, follows, addresses, replies }}) => {
  if (noticed) {
    return favs.filter(f => f.inserted_at > noticed).length
      + follows.filter(f => f.inserted_at > noticed).length
      + addresses.filter(a => a.inserted_at > noticed).length
      + replies.filter(r => r.inserted_at > noticed).length
  } else {
    return favs.length + follows.length + addresses.length + replies.length
  }
}

// Mystery
export const mysteryPageSelector = ({ mysteryPage }) => mysteryPage

// Trusted Servers
export const trustedServersPageSelector = ({ trustedServersPage: page }) => page

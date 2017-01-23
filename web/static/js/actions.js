import { createAction } from 'redux-act'

export const requestInfo = createAction('request info')
export const updateInfo = createAction('update info', info => info)

export const setUser = createAction('set user', user => user)
export const setFollowing = createAction('set following', following => following)

export const reload = createAction('reload')

// Home
export const requestRandomPost = createAction('request random post')
export const setHomePost = createAction('set home post', post => post)

// New post page
export const updatePostText = createAction('update post text', text => text)
export const submitPost = createAction('submit post', text => ({text}))

// User
export const requestUser = createAction('request user', name => name)
export const setUserInfo = createAction('set user info', info => info)
export const follow = createAction('follow', id => id)
export const unfollow = createAction('unfollow', id => id)
export const requestFollow = createAction('request follow', id => id)
export const requestUnfollow = createAction('request unfollow', id => id)

// Public timeline
export const requestPublicTimeline = createAction('request public timeline')
export const updatePublicTimeline = createAction('update public timeline', data => data)

// Timeline
export const requestTimeline = createAction('request timeline')
export const updateTimeline = createAction('update timeline', data => data)

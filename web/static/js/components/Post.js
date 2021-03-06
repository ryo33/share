import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Comment, Icon, Segment, Button } from 'semantic-ui-react'

import UserID from './UserID.js'
import Time from './Time.js'
import FollowButton from './FollowButton.js'
import UserButton from './UserButton.js'
import NewPost from './NewPost.js'
import Mystery from './Mystery.js'
import WithImages from './WithImages.js'
import {
  requestFav, requestUnfav, setAddressPost, submitPost
} from '../actions/index.js'
import { userPage, postPage } from '../pages.js'
import {
  userSelector, favsSelector, isTrustedImageUserFunctionSelector
} from '../selectors.js'
import {
  getTweetURL, createRemotePath, isRemoteHost, getLocalID, isSameUser
} from '../utils.js'

const mapStateToProps = (state) => {
  const user = userSelector(state)
  const favs = favsSelector(state)
  const isTrustedImageUser = isTrustedImageUserFunctionSelector(state)
  return {
    user, favs, isTrustedImageUser
  }
}

const actionCreators = {
  requestFav, requestUnfav, setAddressPost,
  userPageAction: name => userPage.action({name}),
  postPageAction: id => postPage.action({id}),
  submitPost
}

const PostAddresses = ({ user }) => (
  <span key={user.name}>
    <UserButton user={user}>
      <Icon name='send' />
      {user.display} (<UserID user={user} />)
    </UserButton>
  </span>
)

const PostLink = ({ post, onClick }) => {
  const { path, inserted_at, host } = post
  if (isRemoteHost(host)) {
    return (
      <a href={createRemotePath(host, path)}>
        <Icon name='external' />
        <Time time={post.inserted_at} />
      </a>
    )
  } else {
    const id = getLocalID(post)
    return (
      <a href={postPage.path({id})} onClick={onClick}>
        <Time time={post.inserted_at} />
      </a>
    )
  }
}

const ChildPost = ({ postPageAction, post, actions, size }) => {
  const notLoaded = post.post_id != null && post.post == null
  const host = post.host
  if (notLoaded) {
    if (isRemoteHost(host)) {
      return (
        <Segment size={size}>
          <Button as='a' href={createRemotePath(host, post.path)}>
            <Icon name='external' />
            Load More
          </Button>
        </Segment>
      )
    } else {
      return (
        <Segment size={size}>
          <Button onClick={() => postPageAction(getLocalID(post))}>Load More</Button>
        </Segment>
      )
    }
  } else {
    return (
      <Segment size={size}>
        <ConnectedPost
          actions={actions}
          post={post.post}
        />
      </Segment>
    )
  }
}

class Post extends Component {
  constructor(props) {
    super(props)
    this.fav = this.fav.bind(this)
    this.unfav = this.unfav.bind(this)
    this.openReply = this.openReply.bind(this)
    this.closeReply = this.closeReply.bind(this)
    this.openQuote = this.openQuote.bind(this)
    this.closeQuote = this.closeQuote.bind(this)
    this.handleClickUser = this.handleClickUser.bind(this)
    this.handleClickTime = this.handleClickTime.bind(this)
    this.handleEmptyQuote = this.handleEmptyQuote.bind(this)
    this.state = {
      openReply: false,
      openQuote: false,
      emptyQuoted: false
    }
  }

  fav() {
    const { requestFav, post } = this.props
    requestFav(getLocalID(post))
  }

  unfav() {
    const { requestUnfav, post } = this.props
    requestUnfav(getLocalID(post))
  }

  openReply() {
    this.setState({openReply: true, openQuote: false})
  }

  closeReply() {
    this.setState({openReply: false})
  }

  openQuote() {
    this.setState({openQuote: true, openReply: false})
  }

  closeQuote() {
    this.setState({openQuote: false})
  }

  handleClickUser(e) {
    e.preventDefault()
    const { post, userPageAction } = this.props
    userPageAction(post.user.name)
  }

  handleClickTime(e) {
    const { post, postPageAction } = this.props
    e.preventDefault()
    postPageAction(getLocalID(post))
  }

  handleEmptyQuote() {
    const { post, submitPost } = this.props
    submitPost('', null, post)
    this.setState({
      emptyQuoted: true
    })
  }

  renderReplyButton() {
    const { post } = this.props
    const { openReply } = this.state
    if (openReply) {
      return (
        <Comment.Action onClick={this.closeReply}>
          <Icon name='reply' size='large' color='blue' />
        </Comment.Action>
      )
    } else {
      return (
        <Comment.Action onClick={this.openReply}>
          <Icon name='reply' size='large' />
        </Comment.Action>
      )
    }
  }

  renderFavButton() {
    const { favs, post } = this.props
    if (favs.includes(getLocalID(post))) {
      return (
        <Comment.Action onClick={this.unfav}>
          <Icon name='star' color='yellow' size='large' />
        </Comment.Action>
      )
    } else {
      return (
        <Comment.Action onClick={this.fav}>
          <Icon name='empty star' size='large' />
        </Comment.Action>
      )
    }
  }

  renderQuoteButton() {
    const { post } = this.props
    const { openQuote } = this.state
    if (openQuote) {
      return (
        <Comment.Action onClick={this.closeQuote}>
          <Icon name='quote right' size='large' color='blue' />
        </Comment.Action>
      )
    } else {
      return (
        <Comment.Action onClick={this.openQuote}>
          <Icon name='quote right' size='large' />
        </Comment.Action>
      )
    }
  }

  render() {
    const {
      list = false, followButton = true, actions = true, postLink = true,
      attributeIcon, prefix, post, userPageAction, postPageAction,
      user, isTrustedImageUser
    } = this.props
    const { openReply, openQuote, emptyQuoted } = this.state
    const host = post.host || this.props.host
    const remote = isRemoteHost(host)
    const hasChild = post.post != null || post.post_id != null
    const address = post.address_user != null
    const reply = hasChild && address
    const quote = hasChild && !address
    const quoteMystery = post.mystery_id != null
    const empty = !quoteMystery && (post.text ? post.text.length === 0 : true)
    const size = quote ? null : 'tiny'
    const userDisplay = post.user_display || post.user.display
    return (
      <Comment.Group style={{padding: '0px', maxWidth: 'initial'}}>
        <Comment>
          <Comment.Content>
            {reply ? (
              <ChildPost
                post={post}
                postPageAction={postPageAction}
                address={quote}
                size={size}
              />
            ) : null}
            {prefix}
            {quote ? (
              <Icon name={empty ? 'retweet' : 'quote right'}
                size='large' color='blue' />
            ) : null}
            <UserButton Component={Comment.Author} user={post.user}>
              {userDisplay}
            </UserButton>
            <Comment.Metadata>
              <UserID user={post.user} />
              {postLink ? (
                <PostLink
                  post={post}
                  onClick={this.handleClickTime}
                />
              ) : (
                <Time time={post.inserted_at} />
              )}
              {followButton ? (
                <FollowButton user={post.user} />
              ) : null}
              {attributeIcon ? (
                <Icon name={attributeIcon} color='blue' size='large' />
              ) : null}
            </Comment.Metadata>
            <Comment.Text>
              {!reply && address ? (
                <PostAddresses user={post.address_user} />
              ) : null}
              {post.text ? (
                <pre>
                  <WithImages
                    text={post.text}
                    showAlways={
                      isSameUser(user, post.user)
                      || isTrustedImageUser(post.user)
                    }
                  />
                </pre>
              ) : null}
              {quote ? (
                <ChildPost
                  post={post}
                  postPageAction={postPageAction}
                  address={quote}
                  size={size}
                />
              ) : null}
              {post.mystery ? (
                <Segment>
                  <Mystery mystery={post.mystery} />
                </Segment>
              ) : null}
            </Comment.Text>
            {actions && post.text ? (
              <Comment.Actions>
                {this.renderReplyButton()}
                {!remote ? this.renderFavButton() : null}
                {this.renderQuoteButton()}
                <Comment.Action onClick={this.handleEmptyQuote}>
                  {emptyQuoted ? (
                    <Icon name='retweet' size='large' color='green' rotated='clockwise' />
                  ) : (
                    <Icon name='retweet' size='large' />
                  )}
                </Comment.Action>
                <Comment.Action as='a' href={getTweetURL(post)} target='_blank'>
                  <Icon name='twitter' size='large' />
                </Comment.Action>
              </Comment.Actions>
            ): null}
            { openReply ? (
              <NewPost
                rows={3}
                reply={post}
                post={post}
                onSubmitHandler={this.closeReply}
              />
            ) : null }
            { openQuote ? (
              <NewPost
                rows={3}
                post={post}
                allowEmpty
                onSubmitHandler={this.closeQuote}
              />
            ) : null }
          </Comment.Content>
        </Comment>
      </Comment.Group>
    )
  }
}

const user = React.PropTypes.shape({
  name: React.PropTypes.string.isRequired,
  display: React.PropTypes.string.isRequired
})

const ConnectedPost = connect(mapStateToProps, actionCreators)(Post)

ConnectedPost.propTypes = {
  prefix: React.PropTypes.node,
  attributeIcon: React.PropTypes.string,
  followButton: React.PropTypes.bool,
  actions: React.PropTypes.bool,
  post: React.PropTypes.shape({
    post_addresses: React.PropTypes.arrayOf(React.PropTypes.shape({
      user
    })),
    user: user.isRequired,
    text: React.PropTypes.string,
  })
}

export default ConnectedPost

// @flow
import {FilterBigTeamChannel} from '.'
import * as Chat2Gen from '../../../../actions/chat2-gen'
import * as ChatGen from '../../../../actions/chat-gen'
import {pausableConnect} from '../../../../util/container'

const mapStateToProps = (_, {teamname, channelname, isActiveRoute}) => ({
  channelname,
  isActiveRoute,
  teamname,
})

const mapDispatchToProps = (dispatch: Dispatch, {conversationIDKey}) => ({
  onSelectConversation: () => {
    // TODO move to saga
    dispatch(Chat2Gen.createSetInboxFilter({filter: ''}))
    dispatch(ChatGen.createSelectConversation({conversationIDKey, fromUser: true}))
  },
})

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  channelname: stateProps.channelname || '',
  isActiveRoute: stateProps.isActiveRoute,
  onSelectConversation: dispatchProps.onSelectConversation,
  teamname: stateProps.teamname || '',
})

export default pausableConnect(mapStateToProps, mapDispatchToProps, mergeProps)(FilterBigTeamChannel)

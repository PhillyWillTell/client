// @flow
import * as React from 'react'
import * as Kb from '../../../common-adapters'
import * as Styles from '../../../styles'
import {ParticipantsRow, AccountEntry} from '../../common'
import type {CounterpartyType} from '../../../constants/types/wallets'

type ParticipantsProps = {|
  recipientType: CounterpartyType,
  yourUsername: string,
  fromAccountName: string,
  fromAccountContents: string,
  // Must have a recipient user, stellar address, or account
  recipientUsername?: string,
  recipientFullName?: string,
  onShowProfile?: string => void,
  recipientStellarAddress?: string,
  recipientAccountName?: string,
  recipientAccountAssets?: string,
|}

const Participants = (props: ParticipantsProps) => {
  let toFieldContent

  switch (props.recipientType) {
    case 'keybaseUser':
      if (!props.recipientUsername || !props.recipientFullName) {
        throw new Error('Recipient type keybaseUser requires props recipientUsername and recipientFullName')
      }
      toFieldContent = (
        <Kb.NameWithIcon
          colorFollowing={true}
          horizontal={true}
          username={props.recipientUsername}
          metaOne={props.recipientFullName}
          avatarStyle={styles.avatar}
          onClick={props.onShowProfile}
        />
      )
      break
    case 'stellarPublicKey':
      if (!props.recipientStellarAddress) {
        throw new Error('Recipient type stellarPublicKey requires prop recipientStellarAddress')
      }
      toFieldContent = (
        <React.Fragment>
          <Kb.Icon type="icon-stellar-logo-16" style={Kb.iconCastPlatformStyles(styles.stellarIcon)} />
          <Kb.Text type="BodySemibold" style={styles.stellarAddressConfirmText}>
            {props.recipientStellarAddress}
          </Kb.Text>
        </React.Fragment>
      )
      break
    case 'otherAccount':
      if (!props.recipientAccountName || !props.recipientAccountAssets) {
        throw new Error(
          'Recipient type otherAccount requires props recipientAccountName and recipientAccountAssets'
        )
      }
      toFieldContent = (
        <AccountEntry
          keybaseUser={props.yourUsername}
          name={props.recipientAccountName}
          contents={props.recipientAccountAssets}
        />
      )
      break
  }

  return (
    <Kb.Box2 direction="vertical" fullWidth={true}>
      <ParticipantsRow heading="From">
        <AccountEntry
          keybaseUser={props.yourUsername}
          name={props.fromAccountName}
          contents={props.fromAccountContents}
        />
      </ParticipantsRow>
      <ParticipantsRow heading="To" bottomDivider={false}>
        {toFieldContent}
      </ParticipantsRow>
    </Kb.Box2>
  )
}

const styles = Styles.styleSheetCreate({
  avatar: {
    marginRight: 8,
  },
  stellarAddressConfirmText: Styles.platformStyles({
    isElectron: {
      wordBreak: 'break-all',
    },
  }),
  stellarIcon: {
    alignSelf: 'flex-start',
    marginRight: Styles.globalMargins.xxtiny,
  },
})

export default Participants

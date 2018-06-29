// @flow
import * as React from 'react'
import {Box, ButtonBar, StandardScreen, WaitingButton} from '../../common-adapters'
import {NativeImage, ZoomableBox} from '../../common-adapters/mobile.native'
import {globalColors, globalMargins, styleSheetCreate} from '../../styles'
import {isIOS} from '../../constants/platform'
import type {Props} from '.'

const AVATAR_SIZE = 250

class EditAvatar extends React.Component<Props> {
  _h: number = 0
  _w: number = 0
  _x: number = 0
  _y: number = 0

  _onSave = () => {
    if (!this.props.image) {
      throw new Error('Missing image when saving avatar')
    }
    const filename = isIOS ? this.props.image.uri.replace('file://', '') : this.props.image.path
    // Cropping is temporarily deactivated on Andoird.
    if (isIOS) {
      this.props.onSave(filename, this._getCropCoordinates())
      return
    }
    this.props.onSave(filename)
  }

  _getCropCoordinates = () => {
    const x = this._x
    const y = this._y
    const rH = this._h !== 0 && this.props.image ? this.props.image.height / this._h : 1
    const rW = this._w !== 0 && this.props.image ? this.props.image.width / this._w : 1
    const x0 = rW * x
    const y0 = rH * y
    return {
      x0: Math.round(x0),
      x1: Math.round((x + AVATAR_SIZE) * rW),
      y0: Math.round(y0),
      y1: Math.round((y + AVATAR_SIZE) * rH),
    }
  }

  _onZoom = ({height, width, x, y}: {height: number, width: number, x: number, y: number}) => {
    this._h = height
    this._w = width
    this._x = x
    this._y = y
  }

  render() {
    return (
      <StandardScreen onCancel={this.props.onClose} scrollEnabled={false} title="Zoom and pan">
        <Box
          style={{
            marginBottom: globalMargins.small,
            marginTop: globalMargins.small,
          }}
        >
          <Box style={isIOS ? null : styles.zoomContainer}>
            <ZoomableBox
              bounces={false}
              contentContainerStyle={{
                height: this.props.image ? this.props.image.height : AVATAR_SIZE,
                width: this.props.image ? this.props.image.width : AVATAR_SIZE,
              }}
              // Temporarily deactive zooming on Android.
              maxZoom={isIOS ? 10 : 1}
              onZoom={isIOS ? this._onZoom : null}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={styles.zoomContainer}
            >
              <NativeImage
                resizeMode="contain"
                source={{uri: `data:image/jpeg;base64,${this.props.image ? this.props.image.data : ''}`}}
                style={{
                  height: isIOS && this.props.image ? this.props.image.height : AVATAR_SIZE,
                  width: isIOS && this.props.image ? this.props.image.width : AVATAR_SIZE,
                }}
              />
            </ZoomableBox>
          </Box>
          <ButtonBar direction="column">
            <WaitingButton
              fullWidth={true}
              label="Save"
              onClick={this._onSave}
              style={styles.button}
              type="Primary"
              waitingKey={null}
            />
          </ButtonBar>
        </Box>
      </StandardScreen>
    )
  }
}

const styles = styleSheetCreate({
  button: {
    marginTop: globalMargins.tiny,
    width: '100%',
  },
  zoomContainer: {
    alignSelf: 'center',
    backgroundColor: globalColors.lightGrey2,
    borderRadius: AVATAR_SIZE,
    flexShrink: 1,
    height: AVATAR_SIZE,
    marginBottom: globalMargins.tiny,
    overflow: 'hidden',
    position: 'relative',
    width: AVATAR_SIZE,
  },
})

export default EditAvatar

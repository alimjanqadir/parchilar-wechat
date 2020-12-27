import { Button, Image, View } from '@tarojs/components';
import Taro, { Component } from '@tarojs/taro';
import { AtActionSheet, AtActionSheetItem, AtModal, AtModalAction, AtModalContent, AtModalHeader, AtToast } from "taro-ui";
import { DOMAIN } from '../../constants'
import './detail.scss';

class Detail extends Component {
  config = {
    navigationStyle: 'custom'
  }

  constructor() {
    super();
    const { id, imageUrl } = this.$router.params;
    this.state = {
      imageUrl: imageUrl,
      actionSheetVisibility: false,
      likeToastVisibility: false,
      saveToastVisibility: false,
      permissionRequestModalVisibility: false,
      permissionRequestCancledToastVisibility: false,
      saveErrorToastVisibility: false,
    };

    this.handleSave = this.handleSave.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  saveImageToAlbum() {
    let imageUrl = this.state.imageUrl;
    Taro.downloadFile({ url: imageUrl })
      .then((res) => {
        //图片保存到本地
        Taro.saveImageToPhotosAlbum({ filePath: res.tempFilePath })
          .then(() => this.setState({ saveToastVisibility: true }))
          .catch(() => this.setState({ saveErrorToastVisibility: true }));
      })
      .catch(() => this.setState({ saveErrorToastVisibility: true }));
  }

  authorizeWritePermission() {
    Taro.authorize({ scope: 'scope.writePhotosAlbum' })
      .then((res) => {
        console.log(res);
        console.log("authorize: then");
        this.saveImageToAlbum();
      })
      .catch((error) => {
        console.log(error);
        console.log("authorize: catch");
        this.setState({ permissionRequestModalVisibility: true })
      });
  }

  handleLongClick(e) {
    console.log(e);
    this.setState({ actionSheetVisibility: true });
  }

  handleLike() {
    this.setState({ likeToastVisibility: true, actionSheetVisibility: false });
  }

  handleSave() {
    Taro.getSetting().then(
      (settings) => {
        if (!settings.authSetting['scope.writePhotosAlbum']) {
          this.authorizeWritePermission();
        } else {
          this.saveImageToAlbum();
        }
      }
    ).catch(error => console.log(error));
    this.setState({ actionSheetVisibility: false });
  }

  handlePermissionRequestModal() {
    Taro.openSetting({
      success(settingdata) {
        console.log(settingdata)
        if (settingdata.authSetting['scope.writePhotosAlbum']) {
          this.saveImageToAlbum();
        } else {
          this.setState({ permissionRequestCancledToastVisibility: true });
        }
      }
    })
    this.setState({ permissionRequestModalVisibility: false })
  }

  handleCanclePermssionRequestModal() {
    this.setState({ permissionRequestModalVisibility: false, permissionRequestCancledToastVisibility: true })
  }

  handleError(e) {
    this.setState({ requestFailedToastVisibility: true })
  }

  handleLoad(e) {
    console.warn(e);
  }

  render() {
    return (
      <View className='root'>
        <View className='modal' onLongPress={this.handleLongClick} onClick={() => Taro.navigateBack()}>
          <View className='modal-content'>
            <Image src={this.state.imageUrl} mode='widthFix' onError={this.handleError} onLoad={this.handleLoad} />
          </View>
        </View>
        <AtActionSheet isOpened={this.state.actionSheetVisibility} cancelText='بىكار قىلىش'>
          <AtActionSheetItem onClick={() => this.handleLike()}>
            ياقتۇردۇم
          </AtActionSheetItem>
          <AtActionSheetItem onClick={this.handleSave}>
            چۈشۈرۈش
         </AtActionSheetItem>
        </AtActionSheet>
        <AtToast duration={1000} onClose={() => this.setState({ likeToastVisibility: false })} isOpened={this.state.likeToastVisibility} icon='heart-2' text='ياقتۇردىڭىز!&rlm;'></AtToast>
        <AtToast duration={1000} onClose={() => this.setState({ saveToastVisibility: false })} isOpened={this.state.saveToastVisibility} icon='check' text='ئالبومغا ساقلاندى!&rlm;'></AtToast>
        <AtToast duration={5000} onClose={() => this.setState({ permissionRequestCancledToastVisibility: false })} isOpened={this.state.permissionRequestCancledToastVisibility} icon='close' text='ئالبومنى زىيارەت قىلىش ھوقوقىنى تەستىقلىمىدىڭىز، ساقلاش مەغلۇب بولدى!&rlm;'></AtToast>
        <AtToast duration={5000} onClose={() => this.setState({ saveErrorToastVisibility: false })} isOpened={this.state.saveErrorToastVisibility} icon='close' text='ساقلاشتا مەسىلە كۆرۈلدى، سەل تۇرۇپ قايتا سىناڭ!&rlm;'></AtToast>
        <AtToast duration={3000} onClose={() => { this.setState({ requestFailedToastVisibility: false }); Taro.navigateBack(); }} isOpened={this.state.requestFailedToastVisibility} icon='alert-circle' text='رەسىمنى كۆرسۈتۈشتە مەسىلە كۆرۈلدى، سەل تۇرۇپ قايتا سىناڭ!&rlm;'></AtToast>
        <AtModal isOpened={this.state.permissionRequestModalVisibility} closeOnClickOverlay={false} onClose={() => { this.setState({ permissionRequestModalVisibility: false }) }}>
          <AtModalHeader>ھوقوق بېرىڭ</AtModalHeader>
          <AtModalContent className='permission-modal-content'>رەسىمنى ساقلاش ئۈچۈن ئالبومغا ئۇچۇر يېزىش قوقوقىغا ئېھتىياجلىق بولىمىز. ھوقوقنى تەستىقلىماپسىز شۇڭا تەڭشەككە بېرىپ ھوقوقنى ئېچىۋېتىڭ!&rlm;</AtModalContent>
          <AtModalAction>
            <Button onClick={this.handleCanclePermssionRequestModal}>ياق</Button>
            <Button onClick={this.handlePermissionRequestModal}>بولىدۇ</Button>
          </AtModalAction>
        </AtModal>
      </View >
    )
  }
}

export default Detail;

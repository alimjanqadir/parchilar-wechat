import { Image, Text, View, Button } from '@tarojs/components';
import Taro, { Component } from '@tarojs/taro';
import { AtDivider } from 'taro-ui';
import BackIcon from '../../assets/ic-back.svg';
import ErrorIcon from '../../assets/ic-error.svg'
import NetworkErrorIcon from '../../assets/ic-network-error.svg'
import { DOMAIN } from '../../constants'
import './calendar.scss';


class Calendar extends Component {
  state = {
    navBarHeight: 0,
    titleMarginTop: 0,
    calendarHeight: 0,
    data: [],
    isRequestFailed: false,
    isNetworkError: false
  };

  componentWillMount() {
    this.setupDynamicVariablesForUI();
    this.requestData();
  }


  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  config = {
    navigationStyle: 'custom',
    disableScroll: true
  }

  calculateNavigationHeight(statusBarHeight) {
    const rect = Taro.getMenuButtonBoundingClientRect(); // Rect info of the capsule
    const navBarHeight = (function () {
      const gap = rect.top - statusBarHeight; //动态计算每台手机状态栏到胶囊按钮间距
      return 2 * gap + rect.height;
    })();

    return navBarHeight;
  }

  setupDynamicVariablesForUI() {
    const systemInfo = Taro.getSystemInfoSync();
    const capsuleRectInfo = Taro.getMenuButtonBoundingClientRect();

    const statusBarHeight = systemInfo.statusBarHeight
    const navBarHeight = this.calculateNavigationHeight(statusBarHeight);
    const titleMarginTop = capsuleRectInfo.top;
    const navbarHeightWithStatusBar = navBarHeight + statusBarHeight;
    const calendarHeight = systemInfo.screenHeight - navbarHeightWithStatusBar;
    this.setState({ navBarHeight: navbarHeightWithStatusBar, titleMarginTop: titleMarginTop, calendarHeight: calendarHeight });
  }

  requestData() {
    Taro.request({
      url: `${DOMAIN}/posters`,
    })
      .then(res => {
        const statusCode = res.statusCode;
        switch (statusCode) {
          case 200:
            const result = this.prepareData(res.data);
            this.setState({ data: result, isRequestFailed: false, isNetworkError: false });
            break;
          default:
            this.setState({ isRequestFailed: true });
            break;
        }
      })
      .catch(() => {
        this.setState({ isRequestFailed: true, isNetworkError: true });
      });
  }
  prepareData(unPreparedData) {
    let preparedResult = [];
    for (const item of unPreparedData) {
      const lastItem = preparedResult[preparedResult.length - 1];
      if (lastItem) {
        const lastItemDate = new Date(lastItem.date);
        const currentItemDate = new Date(item.date);
        if (currentItemDate.getFullYear() === lastItemDate.getFullYear() && currentItemDate.getMonth() === lastItemDate.getMonth()) {
          lastItem.list.push({ id: item.id, image: `${DOMAIN}/${item.image.url}` });
        } else {
          preparedResult.push({ date: Date.parse(item.date), list: [{ id: item.id, image: `${DOMAIN}/${item.image.url}` }], });
        }
      } else {
        preparedResult.push({ date: Date.parse(item.date), list: [{ id: item.id, image: `${DOMAIN}/${item.image.url}` }], });
      }
    }
    return preparedResult;
  }

  componentDidShow() { }

  componentDidHide() { }

  handleItemClick(e) {
    const reg = /(\d),\s*(\d)/i;
    const Itemindexes = reg.exec(e.currentTarget.id);
    const itemData = this.state.data[Itemindexes[1]].list[Itemindexes[2]];
    const id = itemData.id;
    const imageUrl = itemData.image;
    Taro.navigateTo({
      url: `/pages/detail/detail?id=${id}&imageUrl=${imageUrl}`,
    });
  }

  handleRetry() {
    this.requestData();
  }

  getDummyPosterImages() {
    const dummyContent = [...Array(2).keys()];
    return dummyContent.map((number) => {
      return (
        <View key={number} className='calendar-month'>
          <View>
            <AtDivider className='calendar-month-divider' lineColor='#f0f0f0' />
          </View>
          <View className='calendar-days'>
            <View className='calendar-days-item'>
              <Image id='1' className='calendar-day' mode='aspectFill' src='#' />
              <Image id='2' className='calendar-day' mode='aspectFill' src='#' />
            </View>
            <View className='calendar-days-item'>
              <Image id='3' className='calendar-day' mode='aspectFill' src='#' />
              <Image id='4' className='calendar-day' mode='aspectFill' src='#' />
            </View>
          </View>
        </View>
      )
    });
  }

  getPosterImages() {
    const { data } = this.state
    return data.map((item, i) => {
      const date = new Date(item.date);
      const formattedDate = `\u200f${date.getFullYear()}-يىلى ${date.getMonth() + 1}-ئاي`;
      return (
        <View key={100 + i} className='calendar-month'>
          <View>
            <AtDivider className='calendar-month-divider' content={formattedDate} fontColor='#d8d8d8' lineColor='#f0f0f0' />
          </View>
          <View className='calendar-days'>
            <View className='calendar-days-item'>
              {
                item.list.map((listItem, j) => {
                  return (
                    <Image key={1000 + j} id={[i, j]} className='calendar-day' mode='aspectFill' src={listItem.image} onClick={this.handleItemClick} />
                  )
                })
              }
            </View>
          </View>
        </View>
      )
    });
  }

  getContent() {
    const { data, calendarHeight } = this.state
    const dataSize = data.length;
    return (
      <View className='calendar' style={{ height: `${calendarHeight}PX` }} >
        {dataSize ? this.getPosterImages() : this.getDummyPosterImages()}
      </View>
    );
  }

  getErrorContent() {
    const { calendarHeight, isNetworkError } = this.state;
    return (
      <View className='error-content' style={{ height: `${calendarHeight}PX` }} >
        <Image style={{ width: '100px', height: '100px' }} className='error-content-image' src={isNetworkError ? NetworkErrorIcon : ErrorIcon} />
        <Text className='error-content-text'>{isNetworkError ? 'تورىڭىزدا مەسىلە  باركەن، ئەسىلىگە كەلگەندىن كېيىن قايتا سىناڭ!' : 'مۇلازىمېتېردا مەسىلە كۆرۈلدى، سەل تۇرۇپ قايتا سىناڭ!'}</Text>
        <Button onClick={this.handleRetry} className='error-content-button'>قايتىلاش</Button>
      </View>
    );
  }

  render() {
    return (
      <View className='root'>
        <View className='navBar' style={{ height: `${this.state.navBarHeight}PX` }}>
          <Image className='navbar-back-icon' src={BackIcon} onClick={() => Taro.navigateBack()} style={{ marginTop: `${this.state.titleMarginTop}PX`, width: '20PX', height: '20PX' }} />
          <Text className='navBar-title' style={{ marginTop: `${this.state.titleMarginTop + 5}PX` }}>كالېندار</Text>
        </View>
        <View style={{ marginTop: `${this.state.navBarHeight}PX` }}></View>
        {this.state.isRequestFailed ? this.getErrorContent() : this.getContent()}
      </View>
    )
  }
}

export default Calendar;

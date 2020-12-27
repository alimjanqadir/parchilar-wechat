import { Button, Image, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import Taro, { Component } from '@tarojs/taro'
import { add, asyncAdd, minus } from '../../actions/counter'
import CalendarIcon from '../../assets/ic-calendar.svg'
import ErrorIcon from '../../assets/ic-error.svg'
import NetworkErrorIcon from '../../assets/ic-network-error.svg'
import WechatIcon from '../../assets/wechat-circle.svg'
import { DOMAIN } from '../../constants'
import './index.scss'


@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
  add() {
    dispatch(add())
  },
  dec() {
    dispatch(minus())
  },
  asyncAdd() {
    dispatch(asyncAdd())
  }
}))

class Index extends Component {
  state = {
    navBarHeight: 0,
    titleMarginTop: 0,
    pagerMargin: 0,
    data: [],
    release: 0,
    isRequestFailed: false,
    isNetworkError: false
  };

  componentWillMount() {
    this.setupDynamicVariablesForUI();
    this.requestData();
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  config = {
    navigationStyle: 'custom',
    disableScroll: true
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
    const pagerMargin = systemInfo.screenWidth >= 768 ? 8 * 12 : 8 * 5;
    const navbarHeightWithStatusBar = navBarHeight + statusBarHeight;
    this.setState({ navBarHeight: navbarHeightWithStatusBar, titleMarginTop: titleMarginTop, pagerMargin: pagerMargin });
  }

  prepareData(unPreparedData) {
    let preparedResult = [];
    for (const item of unPreparedData) {
      preparedResult


      preparedResult.push({ id: item.id, release: item.release, image: `${DOMAIN}/${item.image.url}` });
    }
    return preparedResult;
  }
  componentDidShow() { }

  componentDidHide() { }

  handleOnChange(e) {
    console.log(e);
    if (this.state.data.length) {
      this.setState({ release: this.state.data[e.detail.current].release });
    }
  }

  handleItemClick(e) {
    const itemIndex = e.currentTarget.id;
    const id = this.state.data[itemIndex].id;
    const imageUrl = this.state.data[itemIndex].image;
    Taro.navigateTo({
      url: `/pages/detail/detail?id=${id}&imageUrl=${imageUrl}`,
    });
    // console.log(e);
  }

  handleRetry() {
    this.requestData();
  }


  getPosterImages() {
    const { data } = this.state
    return data.map((item, index) => {
      return (
        <SwiperItem id={index} key={item.id} taroKey={item.id}
          className='pager-item' onClick={this.handleItemClick}
        >
          <Image src={item.image} mode='widthFix' />
        </SwiperItem>)
    });
  }

  getDummyPosterImages() {
    const dummyContent = [...Array(2).keys()];
    return dummyContent.map((number) => {
      return (
        <SwiperItem id={number} key={number} taroKey={number}
          className='pager-item' onClick={this.handleItemClick}
        >
          <Image src='#' mode='widthFix' />
        </SwiperItem>)
    });
  }

  getErrorContent() {
    const { isNetworkError } = this.state;
    return (
      <View className='error-content'>
        <Image style={{ width: '100px', height: '100px' }} className='error-content-image' src={isNetworkError ? NetworkErrorIcon : ErrorIcon} />
        <Text className='error-content-text'>{isNetworkError ? 'تورىڭىزدا مەسىلە  باركەن، ئەسىلىگە كەلگەندىن كېيىن قايتا سىناڭ!' : 'مۇلازىمېتېردا مەسىلە كۆرۈلدى، سەل تۇرۇپ قايتا سىناڭ!'}</Text>
        <Button onClick={this.handleRetry} className='error-content-button'>قايتىلاش</Button>
      </View>
    );
  }

  getContent() {
    const { navBarHeight, release, pagerMargin, data } = this.state;
    const dataSize = data.length;
    return (
      <View className='content'>
        <View className='toolBar' style={{ marginTop: `${navBarHeight}PX` }}>
          <Button className='toolBar-button' openType='share'>
            <Image className='toolBar-leftIcon' src={WechatIcon} style={{ width: '20px', height: '20px' }} />
          </Button>
          <View className='toolBar-rightPart'>
            <Text className='toolBar-title'>&rlm;پارچىلار {release}-سان</Text>
            <Image className='toolBar-rightIcon' src={CalendarIcon} style={{ width: '20px', height: '20px' }} onClick={() => Taro.navigateTo({ url: '/pages/calendar/calendar' })} />
          </View>
        </View>
        <Swiper
          onChange={(e) => { this.handleOnChange(e) }}
          className='pager'
          horizontal
          duration='300'
          easingFunction='linear'
          nextMargin={`${pagerMargin}rpx`}
          previousMargin={`${pagerMargin}rpx`}
        >
          {dataSize ? this.getPosterImages() : this.getDummyPosterImages()}
        </Swiper>
      </View>
    );
  }

  render() {
    return (
      <View className='root'>
        <View className='navBar' style={{ height: `${this.state.navBarHeight}PX` }}>
          <Text className='navBar-title' style={{ marginTop: `${this.state.titleMarginTop}PX` }}>پارچىلار</Text>
        </View>
        {this.state.isRequestFailed ? this.getErrorContent() : this.getContent()}
      </View >
    )
  }
}

export default Index

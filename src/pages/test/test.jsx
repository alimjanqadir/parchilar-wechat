import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'

import './test.scss'

class Test extends Component {
  config = {
    navigationStyle: 'custom',
    disableScroll: true
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  render() {
    return (
      <View className='root'>
        <View className='box'></View>
        <View className='scrollView' enableFlex='true'>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        <View className='box-green'></View>
        </View>
      </View>
    )
  }
}

export default Test;

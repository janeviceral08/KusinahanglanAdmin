import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import { Container } from 'native-base';
import CustomHeader from '../component/CustomHeader';

export default class TrackRider extends Component {
  render() {
    return (
    <Container>
        <CustomHeader title="Track Rider"  navigation={this.props.navigation}/>
      <WebView
        source={{ uri: 'https://www.batchbuddies.com/admin/driver_location.php' }}
      />
    </Container>
    );
  }
}
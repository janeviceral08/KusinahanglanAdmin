import React from "react";
import {  StyleSheet, ScrollView, FlatList, View } from "react-native";
import { Grid, Col, Row } from "react-native-easy-grid";
import { Text } from 'react-native-elements';
//import { colors } from "../constants/theme";
//import formatMoney from 'accounting-js/lib/formatMoney.js'

//import Spacer from "./Spacer";

const DataTable = ({ alignment, headerTitles, children, total, qty, TotalDiscount,TotalExtra,TotalDeliveryCharge,TotalSubtotal }) => {
  return (
    <View style={{flex :1}}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
                <Grid>
                    <Row style={{height: 50,  backgroundColor: 'gray'}}>
                        {
                            headerTitles.map((rowData) => (      
                                <Col key={rowData} style={[styles.ColStyle,{alignItems: alignment}]}>
                                    <Text  style={styles.textColor}>{rowData}</Text>
                                </Col>      
                            ))
                        }
                    </Row>
                    {children}
                     <View style={styles.footerContainer}>
                     <Row style={{height: 20,  backgroundColor: 'gray'}}>
                          <Col key={0} style={[styles.ColStyle,{alignItems: alignment}]}>
                                   <Text style={styles.footerBar}>Total</Text>
                                </Col>  
                                  <Col key={1} style={[styles.ColStyle,{alignItems: alignment}]}>
                                    <Text  style={styles.textColor}>&nbsp;</Text>
                                </Col>  
                                  <Col key={2} style={[styles.ColStyle,{alignItems: alignment}]}>
                                    <Text  style={styles.textColor}>{'₱' + parseFloat(TotalSubtotal).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text>
                                </Col>  
                                  <Col key={3} style={[styles.ColStyle,{alignItems: alignment}]}>
                                    <Text  style={styles.textColor}>{'₱' + parseFloat(TotalDeliveryCharge).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text>
                                </Col>  
                                  <Col key={4} style={[styles.ColStyle,{alignItems: alignment}]}>
                                    <Text  style={styles.textColor}>{'₱' + parseFloat(TotalExtra).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text>
                                </Col>  
                                  <Col key={5} style={[styles.ColStyle,{alignItems: alignment}]}>
                                    <Text  style={styles.textColor}>{'₱' + parseFloat(TotalDiscount).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text>
                                </Col>  
                                  <Col key={6} style={[styles.ColStyle,{alignItems: alignment}]}>
                                    <Text style={styles.footerBar}>{'₱' + parseFloat(total).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text>
                                </Col>  
                    </Row>
                       </View>
                </Grid>    
      </View>
    </ScrollView>
  { /* <View style={styles.footerContainer}>
        <View>
            <Text style={styles.footerBar}>Total</Text>
        </View>
        <View>
            <Text style={styles.footerBar}>{qty}</Text>
        </View>
        <View>
            <Text style={styles.footerBar}>{'₱' + parseFloat(total).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text>
        </View>
    </View>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  textColor: {
    fontSize: 14,
    color: 'white',
    fontWeight:'bold'
  },
  ColStyle: {
      width: 80,
      justifyContent: 'center',
      paddingBottom: 5,
  },
  footerBar: {
      color: 'white',
      fontWeight: 'bold'
  },
  footerContainer: {
      flexDirection:'row', 
      justifyContent:'space-between', 
      margin: 10, backgroundColor:'gray', 
      padding: 5,
      paddingHorizontal: 5
    }
});

export default DataTable;

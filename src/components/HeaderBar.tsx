import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { typography } from '../constants/typography';
import imagePaths from '../constants/imagePaths';

type HeaderBarProps = {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  onBack,
  showBack = true,
  rightSlot,
  containerStyle,
  titleStyle,
}) => {
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onBack) return onBack();
    navigation.goBack();
  };

  return (
    <View style={[styles.container, containerStyle]}> 
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} accessibilityRole="button" accessibilityLabel="Go back">
            <Image source={imagePaths.backArrow} style={styles.backIcon} />
          </TouchableOpacity>
        ) : <View style={{ width: 36, height: 36 }} />}
        <View style={{ flex: 1 }} />
        {rightSlot}
      </View>
      {title ? (
        <View style={styles.headerBlock}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  backBtn: {
    // marginRight: 30,
    marginLeft: -15,
    // width: 36,
    // height: 36,
    borderRadius: 18,
    // backgroundColor: 'rgba(0,0,0,0.06)',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  backIcon: {
    width: 34,
    height: 34,
    // resizeMode: 'contain',

    tintColor: COLORS.text.primary,
  },
  headerBlock: {
    marginTop: 12,
  },
  title: {
    fontSize: 22,
    ...typography.bold,
    color: COLORS.text.primary,
    alignSelf: 'center',
  },
});

export default HeaderBar;
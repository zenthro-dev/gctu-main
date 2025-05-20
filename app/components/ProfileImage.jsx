import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useState } from "react";

const ProfileImage = () => {
  const [image, setImage] = useState(null);

  return (
    <Image
      source={
        image
          ? { uri: image }
          : require("../../assets/images/profileSample.jpg")
      }
      style={styles.profileImage}
    />
  );
};

export default ProfileImage;

const styles = StyleSheet.create({});

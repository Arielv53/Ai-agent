import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UserProfile } from "../types";

type Props = { user: UserProfile; onBack: () => void; onBlock: () => void; onReport: () => void };

export default function ProfileHeader({ user, onBack, onBlock, onReport }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = user.name || user.username || "Angler";
  return <View style={styles.header}>
    <ImageBackground source={user.cover_photo ? { uri: user.cover_photo } : require("../../../assets/stats/stats-banner.jpg")} style={styles.coverPhoto} imageStyle={styles.coverImage}>
      <View style={styles.coverShade}/>
      <TouchableOpacity style={[styles.topButton, styles.backButton]} onPress={onBack} accessibilityLabel="Go back"><Ionicons name="arrow-back" size={21} color="#d5f4ff"/></TouchableOpacity>
      <TouchableOpacity style={[styles.topButton, styles.menuButton]} onPress={() => setMenuOpen((open) => !open)} accessibilityLabel="Profile options"><Ionicons name="ellipsis-horizontal" size={23} color="#d5f4ff"/></TouchableOpacity>
      {menuOpen ? <View style={styles.menu}><TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); onBlock(); }}><Ionicons name="ban-outline" size={18} color="#ffd0d0"/><Text style={styles.menuText}>Block user</Text></TouchableOpacity><TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); onReport(); }}><Ionicons name="flag-outline" size={18} color="#ffd0d0"/><Text style={styles.menuText}>Report user</Text></TouchableOpacity></View> : null}
    </ImageBackground>
    <View style={styles.profileRow}><View style={styles.profileRing}>{user.profile_photo ? <Image source={{ uri: user.profile_photo }} style={styles.profilePhoto}/> : <Ionicons name="person" size={42} color="#73ceef"/>}</View><View style={styles.identity}><View style={styles.nameRow}><Text style={styles.name}>{displayName}</Text></View>{user.location ? <View style={styles.locationRow}><Ionicons name="location" size={13} color="#23c1ff"/><Text style={styles.location}>{user.location}</Text></View> : null}</View></View>
  </View>;
}
const styles=StyleSheet.create({header:{height:185,marginHorizontal:14,marginTop:28,borderRadius:11,overflow:"visible",backgroundColor:"#041729",borderWidth:1,borderColor:"#075a83"},coverPhoto:{height:105,width:"100%",borderTopLeftRadius:10,borderTopRightRadius:10,overflow:"hidden"},coverImage:{resizeMode:"cover"},coverShade:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(1,18,31,.24)"},topButton:{position:"absolute",top:12,width:35,height:35,borderRadius:9,backgroundColor:"rgba(2,22,38,.82)",borderWidth:1,borderColor:"#0b6f99",alignItems:"center",justifyContent:"center"},backButton:{left:12},menuButton:{right:12},menu:{position:"absolute",right:12,top:54,width:142,borderRadius:9,borderWidth:1,borderColor:"#0a709e",backgroundColor:"#041b2d",zIndex:5,overflow:"hidden"},menuItem:{flexDirection:"row",alignItems:"center",gap:8,paddingHorizontal:12,paddingVertical:12,borderBottomWidth:1,borderBottomColor:"#0a3751"},menuText:{color:"#e8f8ff",fontSize:13,fontWeight:"600"},profileRow:{position:"absolute",left:16,right:14,bottom:14,flexDirection:"row",alignItems:"center"},profileRing:{width:92,height:92,borderRadius:46,borderWidth:2,borderColor:"#1dbdff",backgroundColor:"#092c43",alignItems:"center",justifyContent:"center",overflow:"hidden"},profilePhoto:{width:"100%",height:"100%"},identity:{marginLeft:14,flex:1,paddingTop:24},nameRow:{flexDirection:"row",alignItems:"center",gap:5},name:{color:"#fff",fontSize:21,fontWeight:"800"},locationRow:{flexDirection:"row",alignItems:"center",gap:4,marginTop:5},location:{color:"#bdd9e6",fontSize:12}});

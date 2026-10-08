import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileStats({ user }: { user: any }) { return <View style={styles.statsRow}><Stat icon="fish-outline" number={user.catch_count ?? 0} label="Total Catches"/><Stat icon="people-outline" number={user.following_count ?? 0} label="Following"/><Stat icon="people-outline" number={user.followers_count ?? 0} label="Followers"/></View>; }
function Stat({icon,number,label}:{icon:any;number:number;label:string}) { return <View style={styles.statBox}><Ionicons name={icon} size={23} color="#18baff"/><View><Text style={styles.statNumber}>{number}</Text><Text style={styles.statLabel}>{label}</Text></View></View>; }
const styles = StyleSheet.create({
  statsRow: {
    height: 50,
    flexDirection: "row",
    marginHorizontal: 11,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#07577f",
    backgroundColor: "#031a2d",
    alignItems: "center",
  },
  statBox: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRightWidth: 1,
    borderRightColor: "#0a3650",
  },
  statNumber: {
    color: "#effaff",
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    color: "#89afc3",
    fontSize: 10,
    marginTop: -1,
  },
});

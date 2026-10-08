import OnboardingSwipe from "@/components/OnboardingSwipe";
import BiteBookLogo from "@/components/BiteBookLogo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ONBOARDING_COMPLETE_KEY } from "../../constants/OnboardingContext";
import { useAuth } from "../../contexts/AuthContext";

type AuthMode = "signup" | "login" | null;

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode: requestedMode } = useLocalSearchParams<{ mode?: "signup" | "login" }>();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>(requestedMode === "login" ? "login" : requestedMode === "signup" ? "signup" : null);
  const [details, setDetails] = useState({ first_name: "", last_name: "", country: "", city: "" });
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (requestedMode === "login" || requestedMode === "signup") setMode(requestedMode); }, [requestedMode]);

  const finishAuth = async () => {
    if (loading) return;
    if (!username.trim()) { setError("Enter your username to continue."); return; }
    try {
      setLoading(true); setError("");
      if (mode === "login") await login(username.trim()); else await signup(username.trim(), details);
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
      router.replace("/(tabs)/Feed");
    } catch (err: any) { setError(err.message || "We couldn't sign you in. Please try again."); }
    finally { setLoading(false); }
  };

  const socialUnavailable = (provider: string) => setError(`${provider} sign-in isn’t available yet. Please use your username.`);

  if (mode) return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.authContainer}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.authScroll, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 24) }]} >
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back" disabled={loading} style={styles.back} onPress={() => { setMode(null); setError(""); }}><Ionicons name="chevron-back" size={26} color="#b7e6fa"/></TouchableOpacity>
    <View style={styles.authContent}>
      <View style={styles.authBrand}><View style={styles.authMark}><BiteBookLogo width={43} height={50}/></View><Text style={styles.authBrandName}>Bite<Text style={styles.brandAccent}>Book</Text></Text></View>
      <Text style={styles.authTitle}>{mode === "signup" ? "Create your account" : "Welcome back"}</Text>
      {mode === "signup" ? <Text style={styles.authSubtitle}>Save your catches and build your personal fishing history.</Text> : <View style={{ height: 24 }} />}
      <View style={styles.inputRow}>
        <Ionicons name="person-outline" size={21} color="#87a9bd" />
        <TextInput accessibilityLabel="Username" editable={!loading} autoCapitalize="none" autoCorrect={false}
          value={username} onChangeText={setUsername} placeholder={mode === "signup" ? "Choose a username" : "Enter your username"}
          placeholderTextColor="#7699ae" style={styles.input} returnKeyType="go" onSubmitEditing={finishAuth}/>
      </View>
      {mode === "signup" && <View style={{ gap: 12, marginTop: 12 }}>
        {([['first_name', 'First name'], ['last_name', 'Last name'], ['country', 'Country'], ['city', 'City']] as const).map(([key, label]) => (
          <View key={key} style={styles.inputRow}>
            <Ionicons name={key === 'country' || key === 'city' ? 'location-outline' : 'person-outline'} size={21} color="#87a9bd" />
            <TextInput value={details[key]} onChangeText={(value) => setDetails((previous) => ({ ...previous, [key]: value }))}
              placeholder={`${label} (optional)`} accessibilityLabel={label} placeholderTextColor="#7699ae"
              style={styles.input} editable={!loading} maxLength={100} autoCapitalize="words" autoCorrect={false} />
          </View>
        ))}
      </View>}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity disabled={loading} accessibilityRole="button" style={[styles.cta, styles.authCta, loading && styles.dimmed]} onPress={finishAuth}>{loading ? <ActivityIndicator color="#fff"/> : <><Text style={styles.ctaText}>{mode === "signup" ? "Create account" : "Log in"}</Text><Ionicons name="arrow-forward" size={20} color="#fff" /></>}</TouchableOpacity>
      <View style={styles.divider}><View style={styles.dividerLine}/><Text style={styles.dividerText}>OR CONTINUE WITH</Text><View style={styles.dividerLine}/></View>
      <SocialButton provider="Google" icon="logo-google" onPress={() => socialUnavailable("Google")}/>
      <SocialButton provider="Facebook" icon="logo-facebook" onPress={() => socialUnavailable("Facebook")}/>
      {Platform.OS === "ios" ? <SocialButton provider="Apple" icon="logo-apple" onPress={() => socialUnavailable("Apple")}/> : null}
      <Text style={styles.switchText}>{mode === "signup" ? "Already have an account?" : "New to BiteBook?"} <Text style={styles.switchLink} onPress={() => { if (loading) return; setMode(mode === "signup" ? "login" : "signup"); setError(""); }}>{mode === "signup" ? "Log in" : "Sign up"}</Text></Text>
    </View>
    </ScrollView>
  </KeyboardAvoidingView>;

  return <OnboardingSwipe page={0}><ImageBackground source={require("../../assets/onboarding/shoreline.png")} style={styles.welcomeBackground}>
    <LinearGradient colors={["rgba(2,11,19,.12)", "rgba(2,11,19,0)", "#020b13", "#020b13"]}
      locations={[0, 0.42, 0.78, 1]} style={StyleSheet.absoluteFill} />
    <ScrollView contentContainerStyle={[styles.welcomeContent, { paddingTop: insets.top + 28, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.brand}><Ionicons name="fish-outline" color="#16b9ff" size={42}/><Text style={styles.brandName}>Bite<Text style={styles.brandAccent}>Book</Text></Text></View>
      <View style={styles.welcomePhotoSpace} />
      <View style={styles.welcomeCopy}>
        <Text style={styles.title}>Log Your Catches.{"\n"}Track Your Progress.</Text>
        <Text style={styles.subtitle}>Keep a record of your fishing trips and key details so you can look back, learn, and catch more quality fish.</Text>
      </View>
      <View style={styles.dots}>{[0,1,2,3].map(dot=><View key={dot} style={[styles.dot,dot===0&&styles.dotActive]}/>)}</View>

      <TouchableOpacity style={styles.loginLink} onPress={() => setMode("login")}><Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkStrong}>Log in</Text></Text></TouchableOpacity>
    </ScrollView>
  </ImageBackground></OnboardingSwipe>;
}

function SocialButton({ provider, icon, onPress }: { provider: string; icon: React.ComponentProps<typeof Ionicons>["name"]; onPress: () => void }) { return <TouchableOpacity style={styles.socialButton} onPress={onPress}><Ionicons name={icon} size={22} color={provider === "Facebook" ? "#1877f2" : provider === "Google" ? "#4285f4" : "#e7f8ff"}/><Text style={styles.socialText}>Continue with {provider}</Text></TouchableOpacity>; }

const styles = StyleSheet.create({
  welcomeBackground: { flex: 1, backgroundColor: "#020b13" },
  welcomeContent: { flexGrow: 1, paddingHorizontal: 26 },
  welcomePhotoSpace: { flex: 1, minHeight: 200 },
  welcomeCopy: { paddingTop: 20, paddingBottom: 24 },
  container:{flex:1,paddingHorizontal:28,paddingVertical:52,overflow:"hidden"},topGlow:{position:"absolute",width:420,height:420,borderRadius:210,backgroundColor:"#056fa8",opacity:.18,top:-180,right:-130},brand:{alignItems:"center",marginTop:8},brandName:{color:"#f4fbff",fontSize:27,fontWeight:"800",marginTop:5},brandAccent:{color:"#19baff"},copy:{flex:1,justifyContent:"flex-end",paddingBottom:34},title:{color:"#fff",fontSize:27,fontWeight:"800",lineHeight:31},subtitle:{color:"#a9c4d5",fontSize:13,lineHeight:19,marginTop:12,maxWidth:275},dots:{flexDirection:"row",justifyContent:"center",gap:7,marginBottom:15},dot:{width:6,height:6,borderRadius:3,backgroundColor:"#26637f"},dotActive:{backgroundColor:"#18baff",width:7,height:7},cta:{height:48,borderRadius:11,backgroundColor:"#119ff0",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:9},ctaText:{color:"#fff",fontSize:14,fontWeight:"700"},loginLink:{alignItems:"center",paddingTop:17},loginLinkText:{color:"#a8c5d5",fontSize:13},loginLinkStrong:{color:"#23bdff",fontWeight:"700"},
  authContainer: { flex: 1, backgroundColor: "#020b13" },
  authScroll: { flexGrow: 1, paddingHorizontal: 28 },
  back: { width: 44, height: 44, justifyContent: "center", marginLeft: -10 },
  authContent: { flexGrow: 1, paddingTop: 22, width: "100%", maxWidth: 480, alignSelf: "center" },
  authBrand: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 },
  authMark: { width: 66, height: 66, borderRadius: 17, alignItems: "center", justifyContent: "center",
    backgroundColor: "#051c2d", borderWidth: 1, borderColor: "#075070" },
  authBrandName: { color: "#f4fbff", fontSize: 27, fontWeight: "800" },
  authTitle: { color: "#fff", fontSize: 32, fontWeight: "800", letterSpacing: -0.6 },
  authSubtitle: { color: "#a7c3d4", fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 28 },
  label: { color: "#cae9f7", fontSize: 13, fontWeight: "600", marginBottom: 9 },
  inputRow: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1,
    borderColor: "#08658b", backgroundColor: "#041522", borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 15, color: "#fff", fontSize: 15 },
  authCta: { marginTop: 14, height: 52, borderRadius: 12, backgroundColor: "#00aced" },
  error: { color: "#ff9b9b", fontSize: 12, lineHeight: 17, marginTop: 9 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 22 },
  dividerLine: { height: 1, backgroundColor: "#16425a", flex: 1 },
  dividerText: { color: "#7699ae", fontSize: 10, fontWeight: "600", letterSpacing: 0.5 },
  socialButton: { minHeight: 51, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#0a506d",
    backgroundColor: "#041522", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 12, marginBottom: 10 },
  socialText: { color: "#e7f8ff", fontSize: 14, fontWeight: "600" },
  switchText: { textAlign: "center", color: "#a7c3d4", fontSize: 14, marginTop: 24, marginBottom: 12 },
  switchLink: { color: "#20bfff", fontWeight: "700" },
  dimmed: { opacity: 0.6 },
});

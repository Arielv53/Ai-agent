import { invalidateFeed } from "@/app/(tabs)/Feed/_hooks/feedCache";
import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Platform } from "react-native";

export function useCatchForm() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const [editReady, setEditReady] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [species, setSpecies] = useState("");
  const [notes, setNotes] = useState("");
  const [caption, setCaption] = useState("");
  const [baitUsed, setBaitUsed] = useState("");
  const [waterTemp, setWaterTemp] = useState("");
  const [airTemp, setAirTemp] = useState("");
  const [moonPhase, setMoonPhase] = useState("");
  const [showMoonDropdown, setShowMoonDropdown] = useState(false);
  const [tide, setTide] = useState("");
  const [showTideDropdown, setShowTideDropdown] = useState(false);
  const [length, setLength] = useState("");
  const [weight, setWeight] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [method, setMethod] = useState("");
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [location, setLocation] = useState("");
  const [dateCaught, setDateCaught] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [openSections, setOpenSections] = useState({
    basic: true,
    weather: true,
    details: true,
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { token } = useAuth();

  useEffect(() => {
    if (!editId || !token) return;
    const controller = new AbortController();
    setEditReady(false); setLoading(true);
    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/catches/${editId}/post`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load catch for editing.");
        const data = await response.json();
        if (controller.signal.aborted) return;
        setFile(data.image_url ? { uri: data.image_url, existing: true } : null);
        setSpecies(String(data.species ?? ""));
        setCaption(String(data.caption ?? ""));
        setNotes(String(data.notes ?? ""));
        setBaitUsed(String(data.bait_used ?? ""));
        setWaterTemp(String(data.water_temp ?? ""));
        setAirTemp(String(data.air_temp ?? ""));
        setMoonPhase(String(data.moon_phase ?? ""));
        setTide(String(data.tide ?? ""));
        setLength(String(data.length ?? ""));
        setWeight(String(data.weight ?? ""));
        setWindSpeed(String(data.wind_speed ?? ""));
        setMethod(String(data.method ?? ""));
        setLocation(String(data.location ?? ""));
        setDateCaught(data.date_caught ? new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(data.date_caught)
          ? data.date_caught : `${data.date_caught}Z`) : null);
        setIsPublic(data.is_public ?? false); setEditReady(true);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Unable to load catch.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [editId, token]);

  // 🐟 Pick image from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selected = result.assets[0];
      setFile({
        uri: selected.uri,
        name: selected.fileName || "catch.jpg",
        type: selected.type || "image/jpeg",
      });
    }
  };

  // 🧾 Submit catch
  const handleSubmit = async () => {
    if (loading || (editId && !editReady)) return;
    if (!file && !editId) {
      setError("Please upload a photo of your catch.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    if (file && !file.existing) formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type === "image" ? "image/jpeg" : file.type,
    } as any);

    formData.append("species", species);
    formData.append("notes", notes);
    formData.append("caption", caption || "");
    formData.append("bait_used", baitUsed);
    formData.append("water_temp", waterTemp);
    formData.append("air_temp", airTemp);
    formData.append("moon_phase", moonPhase);
    formData.append("tide", tide);
    formData.append("length", length);
    formData.append("weight", weight);
    formData.append("wind_speed", windSpeed);
    formData.append("method", method);
    formData.append("location", location);
    if (dateCaught) formData.append("date_caught", dateCaught.toISOString());
    formData.append("is_public", JSON.stringify(isPublic));




    try {
      const response = await fetch(editId ? `${API_BASE}/catches/${editId}` : `${API_BASE}/catches/upload`, {
        method: editId ? "PATCH" : "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      if (!response.ok) { const body = await response.json(); throw new Error(body.error || "Unable to save catch"); }

      await response.json();
      invalidateFeed();
      if (editId) { router.back(); return; }

      setIsPublic(false);
      setFile(null);
      setSpecies("");
      setCaption("");
      setNotes("");
      setBaitUsed("");
      setWaterTemp("");
      setAirTemp("");
      setMoonPhase("");
      setTide("");
      setLength("");
      setWeight("");
      setWindSpeed("");
      setMethod("");
      setLocation("");
      setDateCaught(new Date());
      router.dismissTo({
        pathname: "/(tabs)/Feed",
        params: { refresh: String(Date.now()) },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDateCaught(selectedDate);
  };

  const { reset } = useLocalSearchParams(); // get ?reset=true
  const router = useRouter();

  const clearForm = () => {
    setNotes("");
    setIsPublic(false);
    setFile(null);
    setSpecies("");
    setBaitUsed("");
    setWaterTemp("");
    setAirTemp("");
    setMoonPhase("");
    setTide("");
    setLength("");
    setWeight("");
    setWindSpeed("");
    setMethod("");
    setLocation("");
    setDateCaught(null);
    setError("");
    setSuccess(false);
  };

  // 👀 Watch for reset param
  useEffect(() => {
    if (reset === "true") {
      clearForm();
      // 🧭 replace route to remove ?reset=true from URL
      router.replace("/addCatch");
    }
  }, [reset, router]);

  useEffect(() => {
    if (successMessage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        // fade out after 3 seconds
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }).start(() => setSuccessMessage(""));
        }, 3000);
      });
    }
  }, [successMessage, fadeAnim]);

  const toggleSection = (section: "basic" | "weather" | "details") => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  return {
    editReady,
    file,
    species,
    setSpecies,
    notes,
    setNotes,
    caption,
    setCaption,
    baitUsed,
    setBaitUsed,
    waterTemp,
    setWaterTemp,
    airTemp,
    setAirTemp,
    moonPhase,
    setMoonPhase,
    showMoonDropdown,
    setShowMoonDropdown,
    tide,
    setTide,
    showTideDropdown,
    setShowTideDropdown,
    length,
    setLength,
    weight,
    setWeight,
    windSpeed,
    setWindSpeed,
    method,
    setMethod,
    showMethodDropdown,
    setShowMethodDropdown,
    location,
    setLocation,
    dateCaught,
    showDatePicker,
    setShowDatePicker,
    loading,
    error,
    successMessage,
    isPublic,
    setIsPublic,
    openSections,
    editId,
    fadeAnim,
    pickImage,
    handleSubmit,
    onChangeDate,
    toggleSection,
  };
}

export type CatchForm = ReturnType<typeof useCatchForm>;

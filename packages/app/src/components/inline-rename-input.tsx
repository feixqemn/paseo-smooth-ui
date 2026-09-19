import { useCallback, useRef, useState } from "react";
import {
  Text,
  View,
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type TargetedEvent,
  type TextInputKeyPressEventData,
  type TextInputSubmitEditingEventData,
  type TextStyle,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { EditingTextInput, type EditingTextInputHandle } from "@/components/ui/text-input";
import { isImeComposingKeyboardEvent } from "@/utils/keyboard-ime";

export interface InlineRenameInputProps {
  initialValue: string;
  onSubmit: (value: string) => Promise<void> | void;
  onCancel: () => void;
  style?: StyleProp<TextStyle>;
  maxLength?: number;
  accessibilityLabel?: string;
  testID?: string;
  /** Allow an empty value when clearing a name restores its automatic value. */
  allowEmpty?: boolean;
}

type InlineKeyPressEvent = NativeSyntheticEvent<
  TextInputKeyPressEventData & {
    isComposing?: boolean;
    keyCode?: number;
  }
>;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    minWidth: 0,
  },
  input: {
    flex: 1,
    minWidth: 0,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    outlineWidth: 0,
    backgroundColor: "transparent",
  },
  error: {
    color: theme.colors.destructive,
    fontSize: theme.fontSize.sm,
  },
}));

/**
 * A compact inline editor. A changed value is submitted on Enter or blur;
 * unchanged values and successful saves call onCancel to leave edit mode.
 */
export function InlineRenameInput({
  initialValue,
  onSubmit,
  onCancel,
  style,
  maxLength,
  accessibilityLabel,
  testID,
  allowEmpty = false,
}: InlineRenameInputProps) {
  const { t } = useTranslation();
  const initialValueRef = useRef(initialValue);
  const inputRef = useRef<EditingTextInputHandle | null>(null);
  const settledRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChangeText = useCallback(() => {
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    if (settledRef.current) return;

    const value = inputRef.current?.getText().trim() ?? "";
    if (value === initialValueRef.current.trim()) {
      settledRef.current = true;
      onCancel();
      return;
    }
    if (!value && !allowEmpty) {
      settledRef.current = false;
      setError(t("common.errors.nameRequired"));
      return;
    }

    settledRef.current = true;
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit(value);
      onCancel();
    } catch (error) {
      settledRef.current = false;
      setError(
        error instanceof Error && error.message ? error.message : t("common.errors.unableToSave"),
      );
    } finally {
      setIsSaving(false);
    }
  }, [allowEmpty, onCancel, onSubmit, t]);

  const handleCancel = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    onCancel();
  }, [onCancel]);

  const handleKeyPress = useCallback(
    (event: InlineKeyPressEvent) => {
      event.stopPropagation();
      const nativeEvent = event.nativeEvent;
      if (isImeComposingKeyboardEvent(nativeEvent)) return;
      if (nativeEvent.key === "Escape") {
        event.preventDefault();
        handleCancel();
      }
    },
    [handleCancel],
  );

  const handleSubmitEditing = useCallback(
    (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      event.stopPropagation();
      void submit();
    },
    [submit],
  );

  const handleBlur = useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      event.stopPropagation();
      void submit();
    },
    [submit],
  );

  const stopPressPropagation = useCallback((event: GestureResponderEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <View style={styles.container}>
      <EditingTextInput
        ref={inputRef}
        editable={!isSaving}
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        selectTextOnFocus
        initialValue={initialValue}
        maxLength={maxLength}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        onSubmitEditing={handleSubmitEditing}
        onBlur={handleBlur}
        onPress={stopPressPropagation}
        onPressIn={stopPressPropagation}
        onPressOut={stopPressPropagation}
        style={[styles.input, style]}
      />
      {error ? (
        <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

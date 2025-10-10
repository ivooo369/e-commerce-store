"use client";

import { useState } from "react";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import AlertMessage from "@/ui/components/feedback/alert-message";
import { sendMessage } from "@/services/messageService";
import TurnstileCaptcha from "@/ui/components/forms/turnstile-captcha";

export default function ContactForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [alert, setAlert] = useAutoDismissAlert(5000);
  const [captchaToken, setCaptchaToken] = useState<string>("");

  const mutation = useMutation({
    mutationFn: sendMessage,
    retry: false,
    onMutate: () => {
      setIsSending(true);
    },
    onSuccess: (responseData) => {
      setAlert({
        message: responseData.message,
        severity: "success",
      });

      queryClient.invalidateQueries({ queryKey: ["messages"] });

      setName("");
      setEmail("");
      setTitle("");
      setContent("");
      setIsSending(false);
    },
    onError: (error: { message: string }) => {
      setAlert({
        message:
          error.message || "Възникна грешка при изпращането на съобщението!",
        severity: "error",
      });
      setIsSending(false);
    },
  });

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!captchaToken) {
      setAlert({
        message: "Моля, потвърдете че не сте робот!",
        severity: "error",
      });
      return;
    }

    mutation.mutate({ name, email, title, content, captchaToken });
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 space-y-4 border border-card-border transition-colors duration-300"
    >
      <FormControl fullWidth variant="outlined" required>
        <InputLabel htmlFor="name">Име</InputLabel>
        <OutlinedInput
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Име"
          inputProps={{ maxLength: 100 }}
        />
      </FormControl>
      <FormControl fullWidth variant="outlined" required>
        <InputLabel htmlFor="email">E-mail</InputLabel>
        <OutlinedInput
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="E-mail"
          inputProps={{ maxLength: 100 }}
        />
      </FormControl>
      <FormControl fullWidth variant="outlined" required>
        <InputLabel htmlFor="title">Тема</InputLabel>
        <OutlinedInput
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          label="Тема"
          inputProps={{ maxLength: 100 }}
        />
      </FormControl>
      <TextField
        required
        id="content"
        name="content"
        label="Съобщение"
        multiline
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        fullWidth
        variant="outlined"
        inputProps={{ maxLength: 500 }}
      />

      <Button
        type="submit"
        variant="contained"
        className="font-bold"
        color="primary"
        fullWidth
        disabled={isSending}
      >
        {isSending ? "Изпращане..." : "Изпрати съобщение"}
      </Button>

      <TurnstileCaptcha
        onVerify={(token) => setCaptchaToken(token)}
        onError={() => setCaptchaToken("")}
        onExpire={() => setCaptchaToken("")}
        className="my-4"
      />

      {alert && (
        <AlertMessage severity={alert.severity} message={alert.message} />
      )}
    </form>
  );
}

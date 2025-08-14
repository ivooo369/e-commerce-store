"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import AlertMessage from "@/ui/components/alert-message";
import { sendMessage } from "@/services/messageService";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const mutation = useMutation({
    mutationFn: sendMessage,
    onMutate: () => {
      setIsSending(true);
    },
    onSuccess: (responseData) => {
      setAlert({
        message: responseData.message,
        severity: "success",
      });
      setTimeout(() => setAlert(null), 5000);

      setName("");
      setEmail("");
      setTitle("");
      setContent("");
      setIsSending(false);
    },
    onError: (error: { message: string }) => {
      setAlert({
        message: error.message,
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
      setIsSending(false);
    },
  });

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = {
      name: (e.currentTarget.elements.namedItem("name") as HTMLInputElement)
        .value,
      email: (e.currentTarget.elements.namedItem("email") as HTMLInputElement)
        .value,
      title: (e.currentTarget.elements.namedItem("title") as HTMLInputElement)
        .value,
      content: (
        e.currentTarget.elements.namedItem("content") as HTMLTextAreaElement
      ).value,
    };

    mutation.mutate(formData);
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-2 tracking-wide">
        Контактна форма
      </h1>
      <p className="text-base sm:text-lg text-center text-text-secondary mb-4 sm:mb-6">
        Имате въпрос или предложение? Попълнете формата по-долу и ние ще се
        свържем с вас в най-кратък срок.
      </p>
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
          slotProps={{
            htmlInput: { maxLength: 500 },
          }}
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
        {alert && (
          <div>
            <AlertMessage severity={alert.severity} message={alert.message} />
          </div>
        )}
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import { getCustomButtonStyles } from "../ui/mui-custom-styles/custom-button";
import AlertMessage from "../ui/components/alert-message";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

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

    try {
      const response = await fetch("/api/dashboard/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setAlert({
          message: responseData.error,
          severity: "error",
        });
        setLoading(false);
        setTimeout(() => setAlert(null), 5000);
        return;
      }

      setAlert({
        message: responseData.message,
        severity: "success",
      });
      setLoading(false);
      setTimeout(() => setAlert(null), 5000);

      setName("");
      setEmail("");
      setTitle("");
      setContent("");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLoading(false);
      setAlert({
        message: "Възникна грешка при обработка на заявката!",
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  return (
    <div className="container m-auto p-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4 tracking-wide">
        Контактна форма
      </h2>
      <p className="text-center text-lg text-gray-500 mb-8">
        Имате въпрос или предложение? Попълнете формата по-долу и ние ще се
        свържем с вас в най-кратък срок.
      </p>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 space-y-4"
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
            inputProps={{ maxLength: 255 }}
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
          color="primary"
          fullWidth
          sx={getCustomButtonStyles}
          disabled={loading}
        >
          {loading ? "Изпращане..." : "Изпрати съобщение"}
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

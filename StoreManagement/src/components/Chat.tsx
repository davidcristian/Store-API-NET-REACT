import {
    Button,
    TextField,
    Typography,
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Container,
    Card,
    CardContent,
    CardActions,
} from "@mui/material";

import { useState, useEffect, useRef, useContext } from "react";
import { BACKEND_API_URL } from "../constants";
import { SnackbarContext } from "./SnackbarContext";

export const Chat = () => {
    const openSnackbar = useContext(SnackbarContext);
    const webSocket = useRef<WebSocket | null>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    const [nickName, setNickName] = useState<string | null>(null);
    const [tempName, setTempName] = useState("");

    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        let api_url = BACKEND_API_URL;
        if (api_url.startsWith("https://")) {
            api_url = api_url.replace("https://", "wss://");
        } else if (api_url.startsWith("http://")) {
            api_url = api_url.replace("http://", "ws://");
        } else {
            openSnackbar("error", "Invalid API URL!");
            return;
        }

        webSocket.current = new WebSocket(`${api_url}/chat`);

        webSocket.current.onmessage = (message) => {
            setMessages((prev) => [...prev, message.data]);
        };

        return () => {
            webSocket.current?.close();
        };
    }, []);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTempName(event.target.value);
    };

    const handleSendMessage = () => {
        if (inputValue.length === 0) {
            openSnackbar("error", "Message cannot be empty!");
            return;
        }

        if (webSocket.current && nickName) {
            const data = inputValue;
            setInputValue("");

            webSocket.current.send(data);
        } else {
            openSnackbar("error", "You are not connected to the chat!");
        }
    };

    const handleUsernameSet = () => {
        const newName = tempName.trim();
        if (newName.length < 3) {
            openSnackbar("error", "Nickname must be at least 3 characters!");
            return;
        }

        setNickName(newName);
        console.log("a");
        if (webSocket.current && newName) {
            webSocket.current.send(newName);
        }
    };

    function handleInputKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        const key = event.key;

        if (key === "Enter") {
            handleSendMessage();
        }
    }

    return (
        <Container>
            {!nickName && (
                <Dialog open={true}>
                    <DialogTitle>Information</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="nickname"
                            label="Nickname"
                            type="text"
                            fullWidth
                            onChange={handleNameChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ width: 100, margin: 2, marginTop: 0 }}
                            onClick={handleUsernameSet}
                        >
                            Join
                        </Button>
                        <div style={{ flex: "1 0 0" }}></div>
                    </DialogActions>
                </Dialog>
            )}

            <h1
                style={{
                    paddingTop: 26,
                    marginBottom: 4,
                    textAlign: "center",
                }}
            >
                Chat Room
            </h1>

            {true && (
                <Card
                    sx={{
                        p: 2,
                        height: "75vh",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <CardContent sx={{ overflowY: "auto" }} ref={chatBoxRef}>
                        <Box sx={{ ml: 1 }}>
                            {messages.map((msg, idx) => (
                                <Typography key={idx} variant="body1">
                                    {msg}
                                </Typography>
                            ))}
                        </Box>
                    </CardContent>
                    <CardActions sx={{ mb: 1, ml: 1, mt: "auto" }}>
                        <TextField
                            id="message"
                            label="Message"
                            value={inputValue}
                            variant="outlined"
                            size="small"
                            fullWidth
                            onChange={handleInputChange}
                            onKeyPress={handleInputKeyPress}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ width: 100, ml: 2 }}
                            onClick={handleSendMessage}
                        >
                            Send
                        </Button>
                    </CardActions>
                </Card>
            )}
        </Container>
    );
};

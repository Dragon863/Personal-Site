---
title: "How I made a physical r/place clone"
date: 2024-12-28
draft: false
header_image: "place-cover.png"
header_image_fit: cover
summary: "I made a physical r/place clone using a Raspberry Pi, ESP32, 64x64 LED matrix and a Flask backend. Take a look at how I built it!"
buttons:
left: true
---

This project was built for Hack Club's [High Seas](https://highseas.hackclub.com/) event!

#### Introduction

If you've never seen Reddit's [r/place](https://www.reddit.com/r/place/), it's a social experiment where users can place a pixel on a 1000x1000 canvas every 5 minutes. This leads to some interesting patterns and collaborations, as well as some... less interesting ones. I had the idea to recreate this effect on a smaller scale in real life, using a 64x64 LED matrix I bought from AliExpress, a Pi 4 and an ESP32.

#### The hardware

<img class="round m l" src="/content-res/images/test-place.jpg" style="width:30rem;height:30rem" alt="The main board of the echo"></img>
<img class="round s" src="/content-res/images/test-place.jpg" style="width:100%;height:100%" alt="The main board of the echo"></img>

I bought my 64x64 LED matrix from AliExpress for around £10. It's a P3 panel, which means the LEDs are 3mm apart. This is a decent balance between resolution and cost, and the panel is controlled by a HUB75 interface, which is a standard for LED panels. I've seen some pretty creative uses of these panels, and there are some great writeups on [aslak.net](https://www.aslak.net/index.php/2024/08/18/an-led-display-for-home-assistant-part-3/) detailing how to integrate them with Home Assistant.
I went for an ESP32 and Raspberry Pi 4 to control the panel, but this wouldn't be my first choice. Ideally I wanted to use just a microcontroller, but the performance of the ESP32 wasn't quite enough to handle the web server and the LED panel at the same time. I ended up using Flask on the Pi to handle the web server, and send commands over serial to the board to update the display. Whilst this isn't the most efficient way to do it, it works well enough for my purposes and pixels won't be updated too frequently anyway.

#### The software

The software is split into two parts: the ESP32 firmware and the Flask backend. The ESP32 firmware is responsible for receiving commands over serial and updating the display accordingly. It's a simple program that listens for commands in the format `x y r g b`, where `x` and `y` are the coordinates of the pixel to update, and `r`, `g` and `b` are the red, green and blue values of the pixel. The Flask backend is responsible for serving the web interface and handling the logic of placing pixels. It's a simple app that serves a single HTML page with a canvas element, and listens for POST requests to `/set_pixel_color` with the coordinates and colour of the pixel to place. It then sends the command to the ESP32 over serial, which updates the display accordingly. All API responses are in JSON format, and rate limited by IP address; if there is a timeout, it will respond something like `{"success": False, "try_in": 5}`.

#### Problems

Unfortunately, the internet is the internet and so I had to implement a way for users to report the canvas' current state. Whilst I could've has this send me the reported content, I instead opted to use a LLM to review the content. To do this, I first had the code convert the canvas to a PNG before sending it off to Hack Club's "Jams" API, a service which provides HC members with a limited OpenAI token to use. This API then sends the PNG to OpenAI's GPT-4o model, which then returns a response. This response is then checked for any inappropriate content, and if found, the canvas will be reset. This is all done in a few seconds, and the user will be notified whether the canvas was cleared or not. I'm well aware that this isn't a scalable solution, but it works for now for a small amount of users.

#### Conclusion

This project was a lot of fun to build, and I'm really happy with how it turned out. It's a great conversation starter, and I can't wait to see what people create with it. If you want to try it out for yourself, ~~you can visit [place.danieldb.uk](https://place.danieldb.uk) and start placing pixels~~ (edit: sadly I've had to take this down as it was simply too bright to run in my room 24/7!). I hope you enjoy it as much as I enjoyed creating it!

#### Extra: Bot Protection

Unpopular opinion: I don't think bot protection needs to be there for a project like this. I think it's interesting to see what bots can create, and it's a fun challenge to try and outsmart them. I've seen some really cool bots from running this project for a while, and I think it adds to the experience. That being said, I do have some basic rate limiting in place to prevent abuse, but I think it's important to strike a balance between protecting the project and just seeing people have fun reverse engineering it and creating cool stuff!
---
title: "Building an App to make College Life Easier"
date: 2024-12-02
draft: false
header_image: "runshaw-coverimg.png"
header_image_fit: cover
summary: "I have been working on a Flutter app for me and my friends to share timetables, view bus updates and see who is free when. Read to find out how I built it and what I learned along the way."
buttons:
  - href: "https://apps.apple.com/gb/app/my-runshaw/id6739817271"
    text: "App Store"
    imgUrl: "https://apps.apple.com/favicon.ico"
  - href: "https://play.google.com/store/apps/details?id=com.daniel.runshaw"
    text: "Play Store"
  - href: "https://myrunshaw.danieldb.uk"
    text: "Landing Page"
---


Note: You might notice it's been a while since my last post on here. I've been busy with college, but I'm going to try to post more often.

#### Introduction

Why build this? At my college, we use an [ASP.net](https://dotnet.microsoft.com/en-us/apps/aspnet) based student portal to view most important information including timetables. One feature I found lacking was the ability to see who was free when, and I thought it would be a fun project to build an app to do this. In addition, the "mobile app" is actually just a webview of the website, which is not very user (or mobile data!) friendly. I decided to build a [Flutter](https://flutter.dev/) app to solve these problems.

#### The Concept

The first step was to decide what features the app would have. I wanted to include:
- **Bus notifications**: The official college app's bus notifications are often delayed by ~20 mins
- **Timetables**: A way to import your timetable from the iCal file provided by the college
- **Free time**: A way to see who is and isn't available using gas in their timetable
- **QR Codes**: College ID cards have QR codes which can be scanned to top up money, scan in to areas etc.

#### The QR Codes


<img class="round m l" src="student_id.png" style="width:30rem;height:30rem" alt="The main board of the echo"></img>
<img class="round s" src="student_id.png" style="width:100%;height:100%" alt="The main board of the echo">

QR codes were the first feature I worked on, as they provided an easy way to log in, sign up and add friends. Each student ID badge in my college has a QR code on the front with the student's ID number in text. From looking at a few badges, I noticed that the format was three letters followed by 8 numbers. This makes it a lot easier to validate the student IDs using a simple regex. I used the [mobile_scanner](https://pub.dev/packages/mobile_scanner) package for scanning the codes, as it supports iOS, Android and web.

#### The Timetables

The next feature I worked on was importing timetables. The college provides an iCal file which can be imported into most calendar apps, so I decided to parse this with [icalendar_parser](https://pub.dev/packages/icalendar_parser). This allowed me to store the timetable as a JSON, which I could then upload and sync with the backend in SQLite.

#### Python Backend

I went for a mixture of a dockerised python API and self hosted appwrite for the backend for this project. I chose appwrite just for authentication, as its security has been tested and it is easy to self host. The rest of the backend is a simple flask-based API, with three separate databases for users, timetables and bus updates. The API is hosted on my HP mini PC running Debian (I'll hopefully write a post about this soon!).

#### Notifications

Push notifications are tricky. I tried Firebase first, but eventually settled on [OneSignal](https://onesignal.com/) as it was easy to set up, had a great free tier and an admin SDK for Python. To send bus notifications, I used a subprocess on the backend to poll the bus tracker site every 10 seconds or so (only during reasonable times) and store the bus bay numbers in the sqlite table. If the bus bay number changes, a notification is sent to all users who have the bus route enabled (determined with OneSignal tags).

#### Conclusion

I learnt a bunch from this project, with the main takeaways being:
- **iCal parsing**: I had never worked with iCal files before, so this was a fun challenge, especially calculating free time
- **SQLite**: I had only used SQLite in small projects before, so this was a good opportunity to learn more about it
- **Push notifications**: I had never properly worked with push notifications before, so this was a great learning experience

If I were to remake this project, I'd probably remove appwrite altogether and write my own authentication system. I'd also like to add a feature to see who is in college at the moment, using the college's wifi network. I'm planning to release the app to the App Store soon with [Hack Club's "Cider" program](https://cider.hackclub.com/), so stay tuned for that!

#### Update (December 2024)

The app is now live on the App Store! You can download it [here](https://apps.apple.com/us/app/my-runshaw/id6739817271). 

#### Update 2 (January 2025)

Wow! The app has been a huge success, with almost 1000 downloads in the first few weeks after release on the App Store! I'm currently waiting for the 2 week closed beta period to end before I can submit it to the Play Store, which I hope may almost double user count. Due to the heavy usage, I've made significant changes to the app's backend, rewriting it completely to use postgres and an asynchronous fastapi setup, all containerised more neatly with docker. Overall the app handled scaling pretty well, with reliable and fast push notification despite often having 500 or more concurrent users checking where their buses were! In the future, I'd like to add support for sharing locations on a map of the campus, and maybe work with college IT to make timetable sync easier to set up.

#### Update 3 (April 2025)

I got approved for production on the play store! I've moved a lot of the hosting for this app onto [coolify](https://coolify.danieldb.uk/), which if you haven't already seen is a platform for automated deployments from git which ships with docker support. I'm also now using dedicated hardware thanks to [Britannia IT](https://britanniait.uk/) who generously supplied me with a Gen8 HPE Microserver - hopefully I'll write about that soon! I've implemented in-app notices using appwrite collections, and analytics with my own instance of [aptabase](https://aptabase.com/) to give me insight into what my users do and don't use whilst maintining privacy. Timetable syncing has been migrated to its own container, which is run every day by a cron job to keep timetables in-sync without any user input necessary

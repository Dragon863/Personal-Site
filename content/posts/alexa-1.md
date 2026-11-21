---
title: "Alexa, what is my Wi-Fi password?"
date: 2023-03-16
draft: false
header_image: "echo.jpeg"
header_image_fit: cover
aliases:
    - /blog/alexa
    - /blog/alexa.html
summary: "Taking a closer look at the echo dot 2nd generation using a known CPU exploit reveals a lack of security for its password storage."
buttons:
  - href: "https://news.ycombinator.com/item?id=35399590"
    text: "View on HN"
    imgUrl: "https://news.ycombinator.com/y18.svg"
---

Amazon is well known for its "echo" devices. Launched in 2014, these voice assistants were used to interact with Amazon's services, answer questions, and stream music. As time went on, the devices grew in popularity; as of 2023 they account for 21.7% of global smart speaker purchases. There have been several notable attempts to run custom software on echo devices, such as [this](https://github.com/echohacking/wiki/wiki/Echo) project, however they have proven to be relatively secure. With so many devices in use, a weaponized echo device could be a very dangerous tool, allowing eavesdropping on sensitive conversations, giving false responses, or extracting sensitive information such as Wi-Fi passwords. More modern devices from the company run FireOS, Amazon's modified version of Android, on a MediaTek CPU. This is interesting, as it means both the hardware and software are similar to that found on Amazon Fire tablets. I have been experimenting with an Echo Dot 2nd generation, which uses an MT8163 processor found in the HD 8 from 2018. This fire tablet was rooted using an exploit known as [amonet](https://github.com/xyzz/amonet), which means it was possible to port this exploit to the Echo.

## Exploiting the Processor: You Can Too!

After a few minor modifications, I managed to make the main amonet script dump the contents of the storage (eMMC flash memory). The modified version can be found [here](https://github.com/Dragon863/amonet-echo), and a graphical version is available [here](https://github.com/Dragon863/amonet-graphical/releases). The memory can be dumped when the device is in bootrom mode, which can be forced by placing a piece of tin foil to short the capacitor shown below to the RF shield, which temporarily prevents it from being able to boot. For a detailed disassembly guide, please check iFixit.

<img class="round m l" src="mainboard.jpg" style="width:30rem;height:30rem" alt="The main board of the echo"></img>
<img class="round s" src="mainboard.jpg" style="width:100%;height:100%" alt="The main board of the echo">

Once I had the filesystem, I began to analyze its contents, and what I found was very interesting. It seemed to use a tool called `wpa_supplicant` to manage its wireless connections, which is not uncommon on older Android versions. When using this tool, it is good practice to hash the password for the wireless network before storing it in the configuration file (encrypt it in a way that cannot be reversed). This can be done with one simple command (wpa_passphrase), however, Amazon's internal team Lab126 (who develops their consumer hardware), chose not to use this. It may not seem like a significant decision, however, when you consider that anyone with physical access to an Amazon device using this vulnerable processor (it is also used by multiple Echo Show devices) can extract network passwords with relative ease.

## What Does This Mean?

Storing passwords in plain text is a major security risk in hotels or businesses using the devices on their internal or private wireless networks, giving any potential attackers access to any other equipment on this network or allowing them to create a rogue network and redirect traffic or conduct a MITM (man-in-the-middle) attack. It may also breach the [Data Protection Act](https://www.gov.uk/data-protection) which states customer data must be 'handled in a way that ensures appropriate security'. Hashing passwords is an industry standard, and for a company that has sold their hardware to millions, it is completely unacceptable to not encrypt this data. But it gets even worse. A plain-text configuration file located in `/system/etc` includes API keys for Spotify Zeroconf and eSDK APIs, if accessed these could allow anybody to play audio from the device and potentially send audio to fake a notification or alert.

## Modifications

As for booting modified software, it is difficult but not impossible. Unfortunately, I bricked my Echo by carelessly flashing the wrong file, but not before finding some useful information. All MediaTek devices use something called a `preloader`. It is essentially a loader for the bootloader, a very low-level piece of software that runs on the CPU each boot. If anybody successfully patches the preloader to bypass checks of the MediaTek 'little kernel' (lk) and 'unlock_code', we can write zeros to the start of the preloader and boot from the patched version. However, this would mean using a computer every time you boot your Echo. As the device runs FireOS, the command `fastboot oem flags fos_flags:0x80` should work to disable dm-verity, which is used to verify the integrity of Android images and allow us to run unsigned code. This would be very serious as it would allow devices to be modified to send data to an attacker instead of Amazon.

## Conclusion

In summary, while some aspects of the Echo Dot are very secure, they are not immune to tampering and modification, and demonstrate an extreme lack of security when it comes to password storage. When designing embedded hardware, it is essential to consider physical security, and I hope that we can bring this issue to Amazon's attention and find a permanent solution to prevent any security breaches.

**EDIT** (1.4.2023): Above, I stated that hashing passwords was an industry standard. As others have pointed out, whilst it is good practice, not all devices implement it. Also, the hashes can be used to connect to a network just like a plain text password, so hashing the WPA key is not a solution. Perhaps encrypting the passwords in a proprietary format would be acceptable, but even then it is decryptable.

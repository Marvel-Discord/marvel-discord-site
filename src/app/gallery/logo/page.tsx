"use client";

import { GalleryPage } from "@/components/gallery";
import { GalleryType } from "@/components/gallery/gallery-page";
import type { GalleryEntry } from "@/types";
import type React from "react";

// Ordered by date
const galleryEntries: GalleryEntry[] = [
  {
    title: "Marvel Discord",
    description: "Base logo for the Marvel Discord server.",
    imageUrls: [
      "/img/gallery/logo/Logo with full icon.png",
      "/img/gallery/logo/Base logo.png",
      "/img/gallery/logo/Base logo 2.png",
      "/img/gallery/banner/Banner centred text.png",
      "/img/gallery/banner/Banner new.png",
    ],
    date: new Date("2017-02-16"),
    creator: "Rocked03",
  },
  {
    title: "Marvel Discord Moderation",
    description:
      "Various logos used around the Marvel Discord server. Mailbox art by Mike Del Mundo.",
    imageUrls: [
      "/img/gallery/logo/Mailbox 2.png",
      "/img/gallery/logo/Mod server.png",
      "/img/gallery/logo/Hub.png",
      "/img/gallery/logo/Mailbox Halloween.png",
      "/img/gallery/logo/Mod server Halloween.png",
      "/img/gallery/logo/Hub Halloween.png",
    ],
    date: new Date("2017-02-17"),
    creator: "Rocked03",
  },
  {
    title: "Legion S1",
    description:
      "Our very first logo. Before even settling on the Discord chat bubble design, this played around with the idea of incorporating Discord's branding into our logo. This eyesore was incredibly short-lived...",
    imageUrls: [
      "/img/gallery/logo/Legion logo.png",
      "/img/gallery/logo/Legion logo squared.png",
    ],
    date: new Date("2017-02-22"),
    previewImageIndex: 1,
    creator: "Rocked03",
  },
  {
    title: "Classic Logos - Basics",
    description:
      "Before deciding how logos would be handled, we made a few basic logos. The Spider-Man logo became our default logo to start with.",
    imageUrls: [
      "/img/gallery/logo/spiderman.png",
      "/img/gallery/logo/avengers.png",
      "/img/gallery/logo/captainamerica.png",
      "/img/gallery/logo/captainmarvel.png",
      "/img/gallery/logo/daredevil.png",
      "/img/gallery/logo/fantasticfour.png",
      "/img/gallery/logo/ironman.png",
      "/img/gallery/logo/punisher.png",
      "/img/gallery/logo/xmen.png",
    ],
    date: new Date("2017-03-01"),
  },
  {
    title: "Classic Logos - 2018, pt. 1",
    description:
      "Classic logos for the Marvel Discord server. Featuring logos for Avengers: Infinity War, Deadpool, Ant-Man and the Wasp, Marvel Studios's 10th anniversary, Cloak and Dagger S1, Luke Cage S2, Infinity Wars by Gerry Duggan, and Spider-Man PS4",
    imageUrls: [
      "/img/gallery/logo/avengers IW.png",
      "/img/gallery/logo/deadpool.png",
      "/img/gallery/logo/amatw.png",
      "/img/gallery/logo/amatw 2.png",
      "/img/gallery/logo/amatw 3.png",
      "/img/gallery/logo/amatw 4.png",
      "/img/gallery/logo/marvelstud10s.png",
      "/img/gallery/logo/cloakanddagger.png",
      "/img/gallery/logo/lukecage.png",
      "/img/gallery/logo/infinitywars.png",
      "/img/gallery/logo/spidermanps4.png",
    ],
    date: new Date("2018-09-30"),
    previewImageIndex: 1,
    creator: "Rocked03",
  },
  {
    title: "Classic Logos - 2018, pt. 2",
    description:
      "Classic logos for the Marvel Discord server. Featuring logos for Venom, Daredevil S3, Halloween 2018, [the unfortunate lack of both the Inhumans and Dark Phoenix films failing to make their original release dates], Fantastic Four by Dan Slott, Runaways S2, and Into the Spider-Verse. Daredevil S3 v2 logo made by Aramis Murat.",
    imageUrls: [
      "/img/gallery/logo/venom.png",
      "/img/gallery/logo/daredevils3 bullseye.png",
      "/img/gallery/logo/daredevils3 bullseye v2.png",
      "/img/gallery/logo/ghost.png",
      "/img/gallery/logo/inhuman.png",
      "/img/gallery/logo/poenix.png",
      "/img/gallery/logo/dark inhuman.png",
      "/img/gallery/logo/fantasticfour2018.png",
      "/img/gallery/logo/runaways.png",
      "/img/gallery/logo/spiderverse.png",
      "/img/gallery/logo/spiderverse santa.png",
    ],
    date: new Date("2018-12-31"),
    previewImageIndex: 3,
    creator: "Rocked03",
  },
  {
    title: "Classic Logos - 2019",
    description:
      "Classic logos for the Marvel Discord server. Featuring logos for Spider-Man: Far From Home, Dark Phoenix, Avengers: Endgame, Captain Marvel, and The Punisher S2. Additionally, a logo for Black Panther in respect for Chadwick Boseman's passing (in 2020).",
    imageUrls: [
      "/img/gallery/logo/punisher s2.png",
      "/img/gallery/logo/captmarvel2019.png",
      "/img/gallery/logo/Avengers Endgame.png",
      "/img/gallery/logo/Dark Phoenix.png",
      "/img/gallery/logo/Spider-Man Far From Home.png",
      "/img/gallery/logo/Black Panther.png",
    ],
    date: new Date("2019-12-31"),
    previewImageIndex: 2,
    creator: "Rocked03",
  },
  {
    title: "X of Swords",
    description:
      "Logos and banners for the X of Swords event in the comics. Also including logos for the S.W.O.R.D. and Hellions series and Empyre and King in Black events.",
    imageUrls: [
      "/img/gallery/logo/X of Swords Blue 1.png",
      "/img/gallery/logo/X of Swords Blue 2.png",
      "/img/gallery/logo/X of Swords Orange 1.png",
      "/img/gallery/logo/X of Swords Orange 2.png",
      "/img/gallery/logo/SWORD 1.png",
      "/img/gallery/logo/SWORD 2.png",
      "/img/gallery/logo/Hellions.png",
      "/img/gallery/logo/Empyre.png",
      "/img/gallery/logo/King in Black.png",
      "/img/gallery/banner/X of Swords blue 1.png",
      "/img/gallery/banner/X of Swords blue 2.png",
      "/img/gallery/banner/X of Swords orange 1.png",
      "/img/gallery/banner/X of Swords orange 2.png",
      "/img/gallery/banner/SWORD 1.png",
      "/img/gallery/banner/SWORD 2.png",
    ],
    date: new Date("2020-09-23"),
    creator: "Rocked03",
  },
  {
    title: "Helstrom",
    description: "Logo and banner for the Helstrom series.",
    imageUrls: [
      "/img/gallery/logo/Helstrom.png",
      "/img/gallery/banner/Helstrom.png",
    ],
    date: new Date("2020-10-16"),
    creator: "Rocked03",
  },
  {
    title: "WandaVision",
    description: "Logo for the WandaVision series.",
    imageUrls: ["/img/gallery/logo/WandaVision.png"],
    date: new Date("2021-01-15"),
    creator: "Rocked03",
  },
  {
    title: "The Falcon and the Winter Soldier",
    description: "Logos for the Falcon and the Winter Soldier series.",
    imageUrls: [
      "/img/gallery/logo/The Falcon and the Winter Soldier.png",
      "/img/gallery/logo/The Falcon and the Winter Soldier 3.png",
    ],
    date: new Date("2021-03-19"),
    creator: "Rocked03",
  },
  {
    title: "M.O.D.O.K. S1",
    description: "Logo for season 1 of the M.O.D.O.K. series.",
    imageUrls: ["/img/gallery/logo/MODOK.png"],
    date: new Date("2021-05-21"),
    creator: "Rocked03",
  },
  {
    title: "Hellfire Gala 2021",
    description:
      "Logos and banners for the 2021 Hellfire Gala event in the comics",
    imageUrls: [
      "/img/gallery/logo/Hellfire Gala 4.png",
      "/img/gallery/logo/Hellfire Gala 3.png",
      "/img/gallery/logo/Hellfire Gala 2.png",
      "/img/gallery/logo/Hellfire Gala 1.png",
      "/img/gallery/banner/Hellfire Gala 3.png",
      "/img/gallery/banner/Hellfire Gala 2.png",
      "/img/gallery/banner/Hellfire Gala.png",
    ],
    date: new Date("2021-06-02"),
    creator: "Rocked03",
  },
  {
    title: "Loki S1",
    description: "Logo for season 1 of the Loki series.",
    imageUrls: [
      "/img/gallery/logo/Loki 1.png",
      "/img/gallery/logo/Loki 2.png",
      "/img/gallery/logo/BW and Loki.gif",
    ],
    date: new Date("2021-06-09"),
    creator: "Rocked03",
  },
  {
    title: "Black Widow",
    description: "Logo and banner for the Black Widow film.",
    imageUrls: [
      "/img/gallery/logo/Black Widow.png",
      "/img/gallery/logo/BW and Loki.gif",
      "/img/gallery/banner/Black Widow.png",
    ],
    date: new Date("2021-07-09"),
    creator: "Rocked03",
  },
  {
    title: "What If...? S1",
    description:
      "Series of logos and banner for season 1 of the What If...? series.",
    imageUrls: [
      "/img/gallery/logo/What If.png",
      "/img/gallery/logo/What If Captain Carter.png",
      "/img/gallery/logo/What If T'Challa Star Lord.png",
      "/img/gallery/logo/What If Fury.png",
      "/img/gallery/logo/What If Doctor Strange.png",
      "/img/gallery/logo/What If Zombies.png",
      "/img/gallery/logo/What If Killmonger.png",
      "/img/gallery/logo/What If Thor.png",
      "/img/gallery/logo/What If Avengers.png",
      "/img/gallery/banner/What If.png",
    ],
    date: new Date("2021-08-11"),
    creator: "Rocked03",
  },
  {
    title: "Eternals",
    description: "Logo for the Eternals film.",
    imageUrls: ["/img/gallery/logo/Eternals.png"],
    date: new Date("2021-11-05"),
    creator: "Rocked03",
  },
  {
    title: "Hawkeye",
    description: "Logos and banners for the Hawkeye series.",
    imageUrls: [
      "/img/gallery/logo/Hawkeye (2).png",
      "/img/gallery/logo/Hawkeye.png",
      "/img/gallery/banner/Hawkeye light.png",
      "/img/gallery/banner/Hawkeye dark.png",
    ],
    date: new Date("2021-11-24"),
    creator: "Rocked03",
  },
  {
    title: "Spider-Man: No Way Home",
    description: "Logo for the Spider-Man: No Way Home film.",
    imageUrls: ["/img/gallery/logo/No Way Home.png"],
    date: new Date("2021-12-17"),
    creator: "Rocked03",
  },
  {
    title: "Moon Knight",
    description: "Logo for the Moon Knight series.",
    imageUrls: [
      "/img/gallery/logo/Moon Knight.png",
      "/img/gallery/logo/Mooon Knight.png",
    ],
    date: new Date("2022-03-30"),
    creator: "Rocked03",
  },
  {
    title: "Doctor Strange in the Multiverse of Madness",
    description:
      "Logo for the Doctor Strange in the Multiverse of Madness film. Features fragments of the The Falcon and the Winter Soldier, Loki S1, What If...? S1, Eternals, Spider-Man: No Way Home logos.",
    imageUrls: [
      "/img/gallery/logo/Multiverse of Madness.png",
      "/img/gallery/logo/Multiverse of Madness clean.png",
    ],
    date: new Date("2022-05-06"),
    creator: "Rocked03",
  },
  {
    title: "Ms. Marvel",
    description:
      "Series of animated logos and banner for the Ms. Marvel series. Logos were automatically cycled periodically to add variety.",
    imageUrls: [
      "/img/gallery/logo/Ms Marvel.gif",
      "/img/gallery/logo/Ms Marvel Kamala 1 sticker.gif",
      "/img/gallery/logo/Ms Marvel Kamala 2 sticker.gif",
      "/img/gallery/logo/Ms Marvel Carol 1 sticker.gif",
      "/img/gallery/logo/Ms Marvel Carol 2 sticker.gif",
      "/img/gallery/logo/Ms Marvel Red Dagger.gif",
      "/img/gallery/logo/Ms Marvel Pencil.gif",
      "/img/gallery/logo/Ms Marvel POW sticker.gif",
      "/img/gallery/logo/Ms Marvel.png",
      "/img/gallery/banner/Ms Marvel.png",
      "/img/gallery/banner/Ms Marvel w stickers.png",
    ],
    date: new Date("2022-06-08"),
    previewImageIndex: 8,
    creator: "Rocked03",
  },
  {
    title: "Thor: Love and Thunder",
    description: "Logo for the Thor: Love and Thunder film.",
    imageUrls: ["/img/gallery/logo/Thor Love and Thunder.png"],
    date: new Date("2022-07-06"),
    creator: "Rocked03",
  },
  {
    title: "She-Hulk: Attorney at Law",
    description: "Logo for the She-Hulk: Attorney at Law series.",
    imageUrls: ["/img/gallery/logo/She-Hulk.png"],
    date: new Date("2022-08-18"),
    creator: "Rocked03",
  },
  {
    title: "Werewolf By Night",
    description: "Animated logo for the Werewolf By Night series.",
    imageUrls: [
      "/img/gallery/logo/Werewolf by Night.gif",
      "/img/gallery/logo/Werewolf by Night.jpg",
    ],
    date: new Date("2022-10-07"),
    previewImageIndex: 1,
    creator: "Rocked03",
  },
  {
    title: "Black Panther: Wakanda Forever",
    description:
      "Logo and animated banner for the Black Panther: Wakanda Forever film.",
    imageUrls: [
      "/img/gallery/logo/Wakanda Forever.png",
      "/img/gallery/banner/Wakanda Forever 3840x2190.gif",
      "/img/gallery/banner/Wakanda Forever.png",
    ],
    date: new Date("2022-11-11"),
    creator: "Rocked03",
  },
  {
    title: "The Guardians of the Galaxy Holiday Special",
    description: "Logo for the Guardians of the Galaxy Holiday Special.",
    imageUrls: [
      "/img/gallery/logo/The Guardians of the Galaxy Holiday Special.png",
    ],
    date: new Date("2022-11-25"),
    creator: "Rocked03",
  },
  {
    title: "Sins of Sinister",
    description: "Logo for the Sins of Sinister comic event.",
    imageUrls: ["/img/gallery/logo/Sins of Sinister.png"],
    date: new Date("2023-01-25"),
    creator: "Rocked03",
  },
  {
    title: "Ant-Man and the Wasp: Quantumania",
    description:
      "Animated logo for the Ant-Man and the Wasp: Quantumania film.",
    imageUrls: [
      "/img/gallery/logo/Ant-Man and the Wasp Quantumania.gif",
      "/img/gallery/logo/Ant-Man and the Wasp Quantumania.png",
    ],
    date: new Date("2023-02-17"),
    previewImageIndex: 1,
    creator: "Rocked03",
  },
  {
    title: "Guardians of the Galaxy Vol. 3",
    description: "Logo for the Guardians of the Galaxy Vol. 3 film.",
    imageUrls: ["/img/gallery/logo/Guardians of the Galaxy Vol 3.png"],
    date: new Date("2023-05-05"),
    creator: "Rocked03",
  },
  {
    title: "Across the Spider-Verse",
    description: "Selection of logos for the Across the Spider-Verse film.",
    imageUrls: [
      "/img/gallery/logo/Across the Spider-Verse 3.png",
      "/img/gallery/logo/Across the Spider-Verse 2.png",
      "/img/gallery/logo/Across the Spider-Verse 1.png",
    ],
    date: new Date("2023-06-02"),
    creator: "Krazkat",
  },
  {
    title: "Secret Invasion",
    description: "Logo for the Secret Invasion series.",
    imageUrls: [
      "/img/gallery/logo/Secret Invasion 2.jpg",
      "/img/gallery/logo/Secret Invasion 1.jpg",
    ],
    date: new Date("2023-06-21"),
    creator: "Krazkat",
  },
  {
    title: "Loki S2",
    description: "Logo for season 2 of the Loki series.",
    imageUrls: [
      "/img/gallery/logo/Loki S2 greyed.png",
      "/img/gallery/logo/Loki S2.png",
    ],
    date: new Date("2023-10-05"),
    creator: "Rocked03",
  },
  {
    title: "The Marvels",
    description: "Animated logo for the The Marvels film.",
    imageUrls: [
      "/img/gallery/logo/The Marvels.gif",
      "/img/gallery/logo/The Marvels.png",
    ],
    date: new Date("2023-11-10"),
    previewImageIndex: 1,
    creator: "Rocked03",
  },
  {
    title: "What If...? S2",
    description: "Logo for season 2 of the What If...? series.",
    imageUrls: ["/img/gallery/logo/What If Christmas.png"],
    date: new Date("2023-12-15"),
    creator: "Rocked03",
  },
  {
    title: "Madame Web",
    description: "Logo for the Madame Web film.",
    imageUrls: [
      "/img/gallery/logo/Madame Web.png",
      "/img/gallery/logo/Madame Web alt.png",
    ],
    date: new Date("2024-02-14"),
    creator: "Rocked03",
  },
  {
    title: "X-Men '97 S1",
    description: "Logo for season 1 of the X-Men '97 series.",
    imageUrls: ["/img/gallery/logo/X-Men 97.png"],
    date: new Date("2024-03-20"),
    creator: "Rocked03",
  },
  {
    title: "Pride Month 2024",
    description: "Logo and wallpaper for the Pride Month 2024 event.",
    imageUrls: [
      "/img/gallery/logo/Pride 2024.png",
      "/img/gallery/wallpaper/Pride 2024.png",
    ],
    date: new Date("2024-06-01"),
    creator: "Rocked03",
  },
  {
    title: "Deadpool & Wolverine",
    description:
      "Animated logo and wallpaper for the Deadpool & Wolverine film.",
    imageUrls: [
      "/img/gallery/logo/Deadpool & Wolverine.gif",
      "/img/gallery/logo/Deadpool & Wolverine.png",
      "/img/gallery/wallpaper/Deadpool & Wolverine.png",
    ],
    date: new Date("2024-07-26"),
    previewImageIndex: 1,
    creator: "Rocked03",
  },
  {
    title: "Venom: The Last Dance",
    description: "Logo and wallpaper for the Venom: The Last Dance film.",
    imageUrls: [
      "/img/gallery/logo/Venom 3.png",
      "/img/gallery/wallpaper/Venom The Last Dance.png",
    ],
    date: new Date("2024-10-25"),
    creator: "Rocked03",
  },
  {
    title: "Marvel Rivals",
    description:
      "Animated logo and HD wallpaper to coincide with the release of Marvel Rivals.",
    imageUrls: [
      "/img/gallery/logo/Rivals.gif",
      "/img/gallery/logo/Rivals.png",
      "/img/gallery/wallpaper/Marvel Rivals.png",
      "/img/gallery/wallpaper/Marvel Rivals rivals icon.png",
    ],
    previewImageIndex: 1,
    date: new Date("2024-12-06"),
    creator: "Rocked03",
  },
  {
    title: "Agatha All Along",
    description: "Logo for the Agatha All Along series.",
    imageUrls: ["/img/gallery/logo/Agatha All Along.png"],
    date: new Date("2024-09-18"),
    creator: "Rocked03",
  },
  {
    title: "Captain America: Brave New World",
    description: "Animated logo for the Captain America: Brave New World film.",
    imageUrls: [
      "/img/gallery/logo/Cap Brave New World.gif",
      "/img/gallery/logo/BNW Black w filter.png",
      "/img/gallery/logo/BNW White w filter.png",
    ],
    date: new Date("2025-02-13"),
    previewImageIndex: 1,
    creator: "Rocked03",
  },
  {
    title: "Daredevil: Born Again S1",
    description: "Logo for season 1 of the Daredevil: Born Again series.",
    imageUrls: ["/img/gallery/logo/Daredevil Born Again.png"],
    date: new Date("2025-03-04"),
    creator: "Rocked03",
  },
];

export default function LogoGalleryPage() {
  return (
    <GalleryPage
      galleryEntries={galleryEntries}
      galleryType={GalleryType.Logo}
    />
  );
}

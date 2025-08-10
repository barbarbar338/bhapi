# Brawlhalla API Wrapper

[![stars](https://img.shields.io/github/stars/barbarbar338/bhapi?color=yellow&logo=github&style=for-the-badge)](https://github.com/barbarbar338/bhapi)
[![license](https://img.shields.io/github/license/barbarbar338/bhapi?logo=github&style=for-the-badge)](https://github.com/barbarbar338/bhapi)
[![supportServer](https://img.shields.io/discord/711995199945179187?color=7289DA&label=Support&logo=discord&style=for-the-badge)](https://discord.gg/BjEJFwh)
[![forks](https://img.shields.io/github/forks/barbarbar338/bhapi?color=green&logo=github&style=for-the-badge)](https://github.com/barbarbar338/bhapi)
[![issues](https://img.shields.io/github/issues/barbarbar338/bhapi?color=red&logo=github&style=for-the-badge)](https://github.com/barbarbar338/bhapi)

<p align="center">
  <img src="https://raw.githubusercontent.com/barbarbar338/bh-open-api/refs/heads/main/frontend/public/logo512.png" alt="Logo" width="160" height="160" />
  <h3 align="center">Brawlhalla API Wrapper</h3>

  <p align="center">
    Brawlhalla API JavaScript/TypeScript/NodeJS wrapper
    <br />
    <a href="https://discord.gg/BjEJFwh"><strong>Get support »</strong></a>
    <br />
    <br />
    <a href="https://github.com/barbarbar338/bhapi/issues">Report Bug</a>
    ·
    <a href="https://github.com/barbarbar338/bhapi/issues">Request Feature</a>
    ·
    <a href="https://bhapi.338.rocks">Live Example</a>
  </p>
</p>

Brawlhalla API JavaScript/TypeScript/NodeJS wrapper. Easily make API requests to Brawlhalla API servers.

## 📦 Installation

- Using yarn: `yarn add @barbarbar338/bhapi`
- Using npm: `npm i @barbarbar338/bhapi`

## 🤓 Usage

```js
import { BHAPIError, getStatsByBHID, setApiKey } from "@barbarbar338/bhapi";

// Set your Brawlhalla API key
setApiKey("YOUR_BRAWLHALLA_API_KEY");

try {
	// Fetch stats using Brawlhalla user ID
	const { data } = await getStatsByBHID("brawlhalla_id");
	console.log(data);
} catch (error) {
	if (error instanceof BHAPIError) {
		console.error("Brawlhalla API error:", error);
	} else {
		console.error("Unknown error:", error);
	}
}
```

## 📄 License

Copyright © 2025 [Barış DEMİRCİ](https://github.com/barbarbar338).

Distributed under the [MIT](https://mit-license.org/) License. See `LICENSE` for more information.

## 🧦 Contributing

Feel free to use GitHub's features.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/my-feature`)
3. Run prettier and eslint (`npm run format && npm run lint`)
4. Commit your Changes (`git commit -m 'my awesome feature my-feature'`)
5. Push to the Branch (`git push origin feature/my-feature`)
6. Open a Pull Request

## 🔥 Show your support

Give a ⭐️ if this project helped you!

## 📞 Contact

- Mail: <hi@338.rocks>
- Website: <https://338.rocks>
- Discord: <https://discord.gg/BjEJFwh>
- Instagram: <https://www.instagram.com/ben_baris.d/>

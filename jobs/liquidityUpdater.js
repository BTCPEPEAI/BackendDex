setInterval(async () => {
    const pairs = await TokenPair.find();
    for (const p of pairs) {
      const pair = new ethers.Contract(p.pairAddress, PAIR_ABI, provider);
      const [r0, r1] = await pair.getReserves();
      const price = r1 / r0;
  
      await TokenPair.updateOne(
        { pairAddress: p.pairAddress },
        {
          reserve0: r0.toString(),
          reserve1: r1.toString(),
          price,
          lastUpdated: new Date(),
        }
      );
    }
    console.log('🔄 Liquidity refreshed');
  }, 60000);
  
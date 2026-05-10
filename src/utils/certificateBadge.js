export const getBadge = (level) => {
  const badges = {
    1: {
      title: "Foundation Certification",
      image: "bronze.png",
      color: "#cd7f32",
    },
    2: {
      title: "Professional Certification",
      image: "silver.png",
      color: "#c0c0c0",
    },
    3: {
      title: "Advanced Certification",
      image: "gold.png",
      color: "#d4af37",
    },
  };

  return (
    badges[level] || {
      title: "Master Certification",
      image: "gold.png",
      color: "#b29600",
    }
  );
};

import { html, useEffect, useState } from "./utils/preact-htm.js";
import { getDataURL } from "./utils/helper.js";
import { getLabel as l } from "../localisation/labels.js";

const all = "All categories";

const getColor = (category, loc) => {
  const colors = {
    [l(13, loc, "Books & Reference")]: "#73e4ff",
    [l(13, loc, "Entertainment")]: "#c368f9",
    [l(13, loc, "Gaming")]: "#0280f8",
    [l(13, loc, "Health & Fitness")]: "#60e2b7",
    [l(13, loc, "Other Consumer Publishers")]: "#876AFF",
    [l(13, loc, "Photo & Video")]: "#60e2b7",
    [l(13, loc, "Social Media")]: "#876aff",
    [l(13, loc, "Utility & Productivity")]: "#c368f9",
    [l(13, loc, "All categories")]: "#D9D9D9",
  };
  return colors[category] || "#D9D9D9"; // default color if category not found
};

const getCategoryIcon = (category, loc) => {
  const categoryMapping = {
    [l(13, loc, "Books & Reference")]: "books",
    [l(13, loc, "Entertainment")]: "entertainment",
    [l(13, loc, "Gaming")]: "gaming",
    [l(13, loc, "Health & Fitness")]: "health_fitness",
    [l(13, loc, "Other Consumer Publishers")]: "data",
    [l(13, loc, "Photo & Video")]: "photo_video",
    [l(13, loc, "Social Media")]: "social",
    [l(13, loc, "Utility & Productivity")]: "utility",
  };

  switch (categoryMapping[category]) {
    case "books":
      return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="17" fill="#D9D9D9"/>
        <mask id="mask0_1544_735" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="5" y="4" width="24" height="25">
        <rect x="5.36865" y="4.77148" width="23.2632" height="23.2632" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_1544_735)">
        <path d="M17.0007 24.1583C16.2252 23.5444 15.3852 23.0678 14.4805 22.7286C13.5758 22.3893 12.6388 22.2197 11.6695 22.2197C10.991 22.2197 10.3246 22.3086 9.67034 22.4863C9.01607 22.664 8.39006 22.9144 7.79233 23.2375C7.45307 23.4152 7.12593 23.4071 6.81091 23.2132C6.49589 23.0194 6.33838 22.7367 6.33838 22.3651V10.6851C6.33838 10.5074 6.38281 10.3377 6.47166 10.1762C6.56051 10.0146 6.69379 9.89347 6.87149 9.81269C7.61462 9.42497 8.39006 9.13418 9.19781 8.94032C10.0056 8.74646 10.8295 8.64953 11.6695 8.64953C12.865 8.64953 13.8828 8.78685 14.7228 9.06149C15.5629 9.33612 16.4675 9.75615 17.4368 10.3216C17.6145 10.4185 17.7478 10.5316 17.8367 10.6608C17.9255 10.7901 17.97 10.9597 17.97 11.1697V21.2989C18.6808 20.9596 19.3956 20.7052 20.1145 20.5356C20.8334 20.3659 21.5725 20.2811 22.3318 20.2811C22.9134 20.2811 23.4828 20.3296 24.0402 20.4265C24.5975 20.5234 25.1589 20.6688 25.7243 20.8627V9.20688C25.9667 9.28766 26.205 9.37651 26.4392 9.47344C26.6735 9.57037 26.9037 9.68345 27.1298 9.81269C27.3075 9.89347 27.4408 10.0146 27.5297 10.1762C27.6185 10.3377 27.6629 10.5074 27.6629 10.6851V22.3651C27.6629 22.7367 27.5054 23.0194 27.1904 23.2132C26.8754 23.4071 26.5482 23.4152 26.209 23.2375C25.6113 22.9144 24.9853 22.664 24.331 22.4863C23.6767 22.3086 23.0103 22.2197 22.3318 22.2197C21.3625 22.2197 20.4255 22.3893 19.5208 22.7286C18.6162 23.0678 17.7761 23.5444 17.0007 24.1583ZM20.3932 18.3425V7.68024L23.3011 6.71094V17.3732L20.3932 18.3425Z" fill="#F2F2F2"/>
        </g>
      </svg>`;
    case "entertainment":
      return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="17" fill="#D9D9D9"/>
        <mask id="mask0_1544_756" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="5" y="4" width="25" height="25">
        <rect x="5.36865" y="4.77148" width="23.8596" height="23.8596" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_1544_756)">
        <path d="M14.8628 20.015L21.6064 15.7071L14.8628 11.3992V20.015ZM13.4876 25.6486V23.6603H9.01394C8.56657 23.6603 8.17852 23.4961 7.84978 23.1675C7.52122 22.8388 7.35693 22.4507 7.35693 22.0033V9.41091C7.35693 8.96354 7.52122 8.57549 7.84978 8.24676C8.17852 7.91819 8.56657 7.75391 9.01394 7.75391H25.583C26.0303 7.75391 26.4184 7.91819 26.7471 8.24676C27.0757 8.57549 27.24 8.96354 27.24 9.41091V22.0033C27.24 22.4507 27.0757 22.8388 26.7471 23.1675C26.4184 23.4961 26.0303 23.6603 25.583 23.6603H21.1093V25.6486H13.4876Z" fill="#F2F2F2"/>
      </g>
      </svg>`;
    case "gaming":
      return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="17" fill="#D9D9D9"/>
        <path d="M9.31203 23.6603C8.61049 23.6603 8.06371 23.4215 7.67168 22.9438C7.27949 22.4659 7.13583 21.8376 7.24072 21.0589L8.38399 13.0229C8.52218 12.1061 8.94337 11.3301 9.64756 10.6948C10.3517 10.0597 11.1622 9.74219 12.079 9.74219H22.5343C23.451 9.74219 24.2615 10.0597 24.9657 10.6948C25.6699 11.3301 26.091 12.1061 26.229 13.0229L27.3559 21.0589C27.4608 21.8376 27.3171 22.4659 26.9249 22.9438C26.5329 23.4215 25.9861 23.6603 25.2846 23.6603C24.9146 23.6603 24.5915 23.5982 24.3153 23.4739C24.0392 23.3496 23.799 23.1854 23.5945 22.9811L21.1258 20.5121H13.4708L11.0021 22.9811C10.7976 23.1854 10.5574 23.3496 10.2813 23.4739C10.0051 23.5982 9.68202 23.6603 9.31203 23.6603ZM22.6004 17.6954C22.8711 17.6954 23.1045 17.5974 23.3005 17.4014C23.4965 17.2052 23.5945 16.9718 23.5945 16.7013C23.5945 16.4307 23.4965 16.1973 23.3005 16.0011C23.1045 15.8051 22.8711 15.7071 22.6004 15.7071C22.3298 15.7071 22.0965 15.8051 21.9005 16.0011C21.7043 16.1973 21.6062 16.4307 21.6062 16.7013C21.6062 16.9718 21.7043 17.2052 21.9005 17.4014C22.0965 17.5974 22.3298 17.6954 22.6004 17.6954ZM20.5293 14.5472C20.7999 14.5472 21.0332 14.4492 21.2294 14.2532C21.4254 14.0571 21.5234 13.8238 21.5234 13.553C21.5234 13.2824 21.4254 13.0492 21.2294 12.8531C21.0332 12.657 20.7999 12.5589 20.5293 12.5589C20.2587 12.5589 20.0253 12.657 19.8292 12.8531C19.6332 13.0492 19.5351 13.2824 19.5351 13.553C19.5351 13.8238 19.6332 14.0571 19.8292 14.2532C20.0253 14.4492 20.2587 14.5472 20.5293 14.5472ZM12.9074 17.6126H14.2331V15.7899H16.0556V14.4644H14.2331V12.6419H12.9074V14.4644H11.0849V15.7899H12.9074V17.6126Z" fill="#F2F2F2"/>
      </svg>`;
    case "health_fitness":
      return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="17" fill="#D9D9D9"/>
        <mask id="mask0_1544_745" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="5" y="4" width="25" height="25">
        <rect x="5.36865" y="4.77148" width="23.8596" height="23.8596" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_1544_745)">
        <path d="M7.35693 15.8729V10.405C7.35693 9.95768 7.52122 9.56963 7.84978 9.2409C8.17852 8.91233 8.56657 8.74805 9.01394 8.74805H25.583C26.0303 8.74805 26.4184 8.91233 26.7471 9.2409C27.0757 9.56963 27.24 9.95768 27.24 10.405V17.3972C26.9583 17.2701 26.6725 17.1748 26.3825 17.1114C26.0926 17.0479 25.7985 17.0162 25.5002 17.0162C25.108 17.0162 24.7214 17.0713 24.3403 17.1817C23.9592 17.2922 23.6002 17.4496 23.2634 17.6539C23.0811 17.5379 22.8961 17.4413 22.7084 17.3641C22.5205 17.2867 22.3188 17.2232 22.1034 17.1735V15.8729H18.8145L17.0499 12.3436C16.9782 12.2 16.8732 12.0978 16.735 12.037C16.597 11.9763 16.4534 11.946 16.3043 11.946C16.1552 11.946 16.0116 11.9763 15.8736 12.037C15.7354 12.0978 15.6304 12.2 15.5587 12.3436L12.3277 18.822L11.085 16.3203C11.0133 16.1711 10.9083 16.0593 10.7701 15.9847C10.6321 15.9102 10.4885 15.8729 10.3394 15.8729H7.35693ZM9.01394 24.6545C8.56657 24.6545 8.17852 24.4902 7.84978 24.1616C7.52122 23.8329 7.35693 23.4448 7.35693 22.9975V17.5296H9.81746L11.5821 21.0589C11.6538 21.208 11.7588 21.3198 11.897 21.3944C12.035 21.469 12.1786 21.5062 12.3277 21.5062C12.4768 21.5062 12.6204 21.469 12.7584 21.3944C12.8966 21.3198 13.0016 21.208 13.0733 21.0589L16.3043 14.5805L17.547 17.0823C17.6187 17.2205 17.7167 17.3268 17.841 17.4014C17.9653 17.476 18.0992 17.5187 18.2429 17.5296H19.121C18.381 17.8721 17.7818 18.3886 17.3233 19.079C16.8648 19.7693 16.6356 20.5508 16.6356 21.4235C16.6356 22.1194 16.7557 22.709 16.996 23.1923C17.2362 23.6755 17.5939 24.1629 18.0689 24.6545H9.01394ZM21.0265 18.6896C21.4739 18.6896 21.8881 18.789 22.2692 18.9878C22.6503 19.1866 22.9817 19.4766 23.2634 19.8577C23.545 19.4766 23.8764 19.1866 24.2575 18.9878C24.6386 18.789 25.0528 18.6896 25.5002 18.6896C26.2624 18.6896 26.9086 18.9547 27.4388 19.4849C27.969 20.0151 28.2341 20.6613 28.2341 21.4235C28.2341 22.02 28.0187 22.5958 27.5879 23.1508C27.1571 23.7059 26.2127 24.6048 24.7546 25.8475L23.2634 27.1399L21.7721 25.8475C20.314 24.6048 19.3696 23.7059 18.9388 23.1508C18.508 22.5958 18.2926 22.02 18.2926 21.4235C18.2926 20.6613 18.5577 20.0151 19.0879 19.4849C19.6181 18.9547 20.2643 18.6896 21.0265 18.6896Z" fill="#F2F2F2"/>
      </g>
      </svg>`;
    case "data":
      return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="17" fill="#D9D9D9"/>
        <path d="M7.35693 25.4829V23.8261H27.24V25.4829H7.35693ZM8.35109 22.5004V15.7071H11.0022V22.5004H8.35109ZM13.4213 22.5004V10.7364H16.0724V22.5004H13.4213ZM18.5081 22.5004V13.7188H21.159V22.5004H18.5081ZM23.5947 22.5004V7.75391H26.2458V22.5004H23.5947Z" fill="#F2F2F2"/>
      </svg>`;
    case "photo_video":
      return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="17" fill="#D9D9D9"/>
        <path d="M17.0331 21.8058C18.193 21.8058 19.1789 21.3998 19.9907 20.5879C20.8026 19.776 21.2086 18.7902 21.2086 17.6303C21.2086 16.4705 20.8026 15.4846 19.9907 14.6727C19.1789 13.8608 18.193 13.4549 17.0331 13.4549C15.8733 13.4549 14.8874 13.8608 14.0755 14.6727C13.2637 15.4846 12.8577 16.4705 12.8577 17.6303C12.8577 18.7902 13.2637 19.776 14.0755 20.5879C14.8874 21.3998 15.8733 21.8058 17.0331 21.8058ZM17.0331 19.95C16.3836 19.95 15.8346 19.7258 15.3862 19.2773C14.9377 18.8288 14.7135 18.2798 14.7135 17.6303C14.7135 16.9808 14.9377 16.4318 15.3862 15.9833C15.8346 15.5349 16.3836 15.3106 17.0331 15.3106C17.6827 15.3106 18.2317 15.5349 18.6801 15.9833C19.1286 16.4318 19.3528 16.9808 19.3528 17.6303C19.3528 18.2798 19.1286 18.8288 18.6801 19.2773C18.2317 19.7258 17.6827 19.95 17.0331 19.95ZM9.61014 25.0533C9.09981 25.0533 8.66294 24.8716 8.29952 24.5082C7.9361 24.1448 7.75439 23.7079 7.75439 23.1976V12.0631C7.75439 11.5527 7.9361 11.1159 8.29952 10.7524C8.66294 10.389 9.09981 10.2073 9.61014 10.2073H12.533L14.2495 8.35156H19.8168L21.5333 10.2073H24.4561C24.9665 10.2073 25.4034 10.389 25.7668 10.7524C26.1302 11.1159 26.3119 11.5527 26.3119 12.0631V23.1976C26.3119 23.7079 26.1302 24.1448 25.7668 24.5082C25.4034 24.8716 24.9665 25.0533 24.4561 25.0533H9.61014Z" fill="#F2F2F2"/>
      </svg>`;
    case "social":
      return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="17" fill="#D9D9D9"/>
        <mask id="mask0_1544_766" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="5" y="4" width="25" height="25">
        <rect x="5.36865" y="4.77148" width="23.8596" height="23.8596" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_1544_766)">
        <path d="M13.3218 18.6896H21.2751V18.1925C21.2751 17.4855 20.9188 16.9304 20.2064 16.5273C19.4939 16.1242 18.5246 15.9226 17.2985 15.9226C16.0723 15.9226 15.103 16.1242 14.3906 16.5273C13.6781 16.9304 13.3218 17.4855 13.3218 18.1925V18.6896ZM17.2985 14.4975C17.8232 14.4975 18.2692 14.3139 18.6363 13.9467C19.0037 13.5794 19.1873 13.1334 19.1873 12.6086C19.1873 12.084 19.0037 11.6381 18.6363 11.2707C18.2692 10.9034 17.8232 10.7197 17.2985 10.7197C16.7737 10.7197 16.3277 10.9034 15.9606 11.2707C15.5932 11.6381 15.4096 12.084 15.4096 12.6086C15.4096 13.1334 15.5932 13.5794 15.9606 13.9467C16.3277 14.3139 16.7737 14.4975 17.2985 14.4975ZM7.35693 26.6428V8.41677C7.35693 7.9694 7.52122 7.58135 7.84978 7.25262C8.17852 6.92405 8.56657 6.75977 9.01394 6.75977H25.583C26.0303 6.75977 26.4184 6.92405 26.7471 7.25262C27.0757 7.58135 27.24 7.9694 27.24 8.41677V21.0092C27.24 21.4566 27.0757 21.8446 26.7471 22.1734C26.4184 22.5019 26.0303 22.6662 25.583 22.6662H11.3335L7.35693 26.6428Z" fill="#F2F2F2"/>
      </g>
      </svg>`;
    case "utility":
      return `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="17" fill="#D9D9D9"/>
        <mask id="mask0_2423_3872" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="5" y="4" width="25" height="25">
        <rect x="5.36841" y="4.77148" width="23.8596" height="23.8596" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_2423_3872)">
        <path d="M24.3567 25.6491L18.3836 19.676L20.024 18.0356L25.9971 24.0087L24.3567 25.6491ZM10.157 25.6491L8.51664 24.0087L15.6082 16.9172L13.2719 14.5809L12.6588 15.1938L11.5073 14.0424V16.1301L10.8778 16.7596L7.85379 13.7359L8.48334 13.1061H10.5877L9.37807 11.8967L12.7251 8.54967C13.0234 8.25142 13.3465 8.04431 13.6944 7.92832C14.0424 7.81234 14.4152 7.75435 14.8129 7.75435C15.2105 7.75435 15.5833 7.82617 15.9313 7.96983C16.2792 8.11332 16.6023 8.33419 16.9006 8.63243L14.3655 11.1675L15.5751 12.3772L14.9453 13.0067L17.2319 15.2933L19.9991 12.5263C19.8886 12.322 19.8016 12.0927 19.7381 11.8386C19.6745 11.5846 19.6427 11.3195 19.6427 11.0432C19.6427 10.1319 19.9672 9.35187 20.6162 8.70302C21.2652 8.054 22.0454 7.72949 22.9567 7.72949C23.2052 7.72949 23.4248 7.75435 23.6153 7.80405C23.8059 7.85376 23.9784 7.92277 24.133 8.01109L21.9044 10.2397L23.7436 12.0789L25.9722 9.85027C26.0662 10.016 26.1393 10.1996 26.1917 10.4013C26.2442 10.6029 26.2705 10.828 26.2705 11.0766C26.2705 11.9879 25.946 12.7679 25.2969 13.4168C24.6481 14.0658 23.868 14.3903 22.9567 14.3903C22.6916 14.3903 22.4541 14.371 22.2441 14.3324C22.0342 14.2936 21.8381 14.2328 21.6559 14.15L10.157 25.6491Z" fill="#F2F2F2"/>
      </g>
      </svg>`;
    default:
      return null;
  }
};

export function Vis13({ locale: loc }) {
  const [data, setData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(l(13, loc, all));
  const [hoveredItem, setHoveredItem] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    d3.csv(getDataURL("Viz13-CPP", loc)).then((data) => {
      data.forEach((d, i) => {
        d["value"] = +d["CPP"];
      });

      // Assign a stable random offset for value > 200, to avoid perfect overlap in the outlier section of the chart
      let jitterSeed = 42;
      function seededRandom(seed) {
        // Simple LCG
        let m = 0x80000000,
          a = 1103515245,
          c = 12345;
        seed = (a * seed + c) % m;
        return seed / m;
      }
      data.forEach((d, i) => {
        if (d["value"] > 200) {
          // Use a hash of advertiser+publisher for stable seed
          let str =
            (d["Advertiser Genre"] || "") + (d["Publisher Genre"] || "") + i;
          let hash = 0;
          for (let j = 0; j < str.length; j++) {
            hash = (hash << 5) - hash + str.charCodeAt(j);
            hash |= 0;
          }
          let rand = seededRandom(hash + jitterSeed);
          let factor = window.innerWidth <= 480 ? 2.5 : 10;
          d._xJitter = (rand - 0.5) * factor;
        }
      });

      setData(data);
    });
  }, []);

  useEffect(() => {
    // Listen for custom category change events
    const handleCategoryChange = (e) => {
      const newCategory = e.detail.selectedCategory;
      if (newCategory && newCategory !== selectedCategory)
        setSelectedCategory(newCategory);
    };
    document.addEventListener("viz13CategoryChanged", handleCategoryChange);

    return () => {
      document.removeEventListener(
        "viz13CategoryChanged",
        handleCategoryChange
      );
    };
  }, [selectedCategory]);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  const vis13Container = document.querySelector("#vis13");
  const width =
    vis13Container && vis13Container.offsetWidth
      ? vis13Container.offsetWidth
      : 1000;
  const isMobile = width <= 480;
  const height = 800;
  const margin = { top: 120, right: 8, bottom: 20, left: isMobile ? 8 : 160 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const advertisers = Array.from(
    new Set(data.map((d) => d["Advertiser Genre"]))
  );

  const getAdvertiserMapping = (advertiser, loc) => {
    if (loc === "en" && advertiser === "Other Consumer Advertisers") {
      return "Other";
    }
    return advertiser;
  };

  const xScale = d3
    .scaleLinear()
    .domain([40, 210])
    .range([0, innerWidth])
    .clamp(true);

  const yScale = d3.scalePoint(advertisers, [0, innerHeight]);

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%;"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        <g class="y-axis">
          ${advertisers.map((adv) => {
            let textPlacement = "";
            if (!isMobile) {
              textPlacement = html`<text
                transform="translate(0, ${yScale(adv)})"
                x="-10"
                y="5"
                text-anchor="end"
                class="charts-text-body"
                fill="#000)"
                font-family="Montserrat"
                font-size="14px"
                font-style="normal"
                font-weight="400"
                line-height="125%"
              >
                ${getAdvertiserMapping(adv, loc)}
              </text>`;
            } else {
              textPlacement = html`<text
                transform="translate(0, ${yScale(adv)})"
                x="-5"
                y="-25"
                text-anchor="start"
                class="charts-text-body"
                fill="#000)"
                font-family="Montserrat"
                font-size="14px"
                font-style="normal"
                font-weight="400"
                line-height="125%"
              >
                ${getAdvertiserMapping(adv, loc)}
              </text>`;
            }
            return html`<g>
              ${textPlacement}
              <line
                transform="translate(0, ${yScale(adv)})"
                x1="-5"
                x2="${innerWidth}"
                y1="0"
                y2="0"
                stroke="#f2f2f2"
                stroke-width="1.6"
              />
            </g>`;
          })}
        </g>
        <g class="x-axis">
          ${xScale
            .ticks(7)
            .map(
              (tick) => html`<text
                transform="translate(${xScale(tick)}, 0)"
                x="0"
                y="${-margin.top + 40}"
                text-anchor="middle"
                class="charts-text-body"
              >
                ${tick}
              </text>`
            )}
          <line
            x1="${xScale(100)}"
            x2="${xScale(100)}"
            y1="${-margin.top + 50}"
            y2="${innerHeight + 20}"
            class="charts-line-dashed"
          />
          <text
            x="${innerWidth / 2}"
            y="${-margin.top + 10}"
            text-anchor="middle"
            class="charts-text-body-bold"
          >
            ${l(13, loc, "Indexed CPP")}
          </text>
          ${!isMobile
            ? html`<text
                x="${-margin.left}"
                y="${-30}"
                text-anchor="start"
                class="charts-text-body-bold"
              >
                ${l(13, loc, "Advertiser category")}
              </text>`
            : ""}
          <g transform="translate(${xScale(200)}, 0)">
            <path
              transform="translate(${-15 / 2}, ${-25 - 15 - 5})"
              stroke="#000"
              stroke-width=".5"
              fill="none"
              d="M0 7.9h3.375L6.19 1l2.612 13.802L11.617 7.9H15"
            />
            <line
              y1="${-25}"
              y2="${innerHeight + 20}"
              class="charts-line-dashed charts-line-dashed-black"
            />
          </g>
        </g>

        <g class="dots">
          ${advertisers.map((adv) => {
            const advertiserData = data.filter(
              (d) => d["Advertiser Genre"] === adv
            );
            return html`<g>
              ${advertiserData.map((datum) => {
                return html`
                  <circle
                    cx="${datum["value"] < 200
                      ? xScale(datum["value"])
                      : xScale(205) + (datum._xJitter || 0)}"
                    cy="${yScale(adv)}"
                    r="9.5"
                    fill="${getColor(datum["Publisher Genre"], loc)}"
                    opacity="${selectedCategory === l(13, loc, all)
                      ? 1
                      : datum["Publisher Genre"] === selectedCategory
                      ? 1
                      : 0.2}"
                    onmouseover="${() => {
                      if (
                        selectedCategory === all ||
                        datum["Publisher Genre"] === selectedCategory
                      ) {
                        let tooltipX =
                          ((margin.left + xScale(datum["value"]) + 9.5 + 20) /
                            width) *
                          100;
                        if (datum["value"] > 200) {
                          tooltipX =
                            ((margin.left + xScale(170) + 9.5 + 20) / width) *
                            100;
                        }

                        setHoveredItem({
                          advertiser: datum["Advertiser Genre"],
                          publisher: datum["Publisher Genre"],
                          roas: datum["value"],
                          x: tooltipX,
                          y: ((margin.top + yScale(adv)) / height) * 100,
                        });
                      }
                    }}"
                    onmouseout="${() => {
                      setHoveredItem(null);
                    }}"
                    class="${selectedCategory === all ||
                    datum["Publisher Genre"] === selectedCategory
                      ? "active"
                      : "inactive"}"
                  />
                `;
              })}
            </g>`;
          })}
        </g>
      </g>
    </svg>
    <${Tooltip} hoveredItem=${hoveredItem} loc=${loc} />
  </div>`;
}

function Tooltip({ hoveredItem, loc }) {
  if (!hoveredItem) return null;

  return html`<div
    class="tooltip"
    style="left: ${hoveredItem.x}%; top: ${hoveredItem.y}%;"
  >
    <div>
      <p class="tooltip-label">${l(13, loc, "Advertiser category")}</p>
      <p class="tooltip-value">${hoveredItem.advertiser}</p>
    </div>
    <div>
      <p class="tooltip-label">${l(13, loc, "Publisher category")}</p>
      <p class="tooltip-value">${hoveredItem.publisher}</p>
    </div>
    <div>
      <p class="tooltip-label">${l(13, loc, "Indexed cost per payer")}</p>
      <p class="tooltip-value">${hoveredItem.roas}</p>
    </div>
  </div>`;
}

export function Vis13Categories({ locale: loc }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(l(13, loc, all));

  // get categories
  useEffect(() => {
    d3.csv(getDataURL("Viz13-CPP", loc)).then((data) => {
      const uniqueCategories = Array.from(
        new Set(data.map((d) => d["Publisher Genre"]))
      ).sort();
      setCategories([l(13, loc, all), ...uniqueCategories]);
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--vis13-main-color",
      getColor(selectedCategory, loc)
    );
  }, [selectedCategory]);

  function getCategoryLabel(category) {
    const labelMap = {
      "All categories": "All categories",
      "Books & Reference": "Books & Reference",
      Entertainment: "Entertainment",
      Gaming: "Gaming",
      "Health & Fitness": "Health & Fitness",
      "Other Consumer Publishers": "Other Consumer",
      "Photo & Video": "Photo & Video",
      "Social Media": "Social Media",
      "Utility & Productivity": "Utility & Productivity",
    };
    return labelMap[category] || category;
  }

  const categoryItems = categories.map((category) => {
    const svgContent = getCategoryIcon(category, loc);

    return html`<li
      class="category-item ${selectedCategory === category
        ? "active"
        : "inactive"}"
      onClick="${() => {
        setSelectedCategory(category);

        // Dispatch custom event to notify other components
        document.dispatchEvent(
          new CustomEvent("viz13CategoryChanged", {
            detail: { selectedCategory: category },
          })
        );
      }}"
    >
      <div
        class="category-icon"
        dangerouslySetInnerHTML=${{ __html: svgContent || "" }}
      ></div>
      <span>${l(13, loc, getCategoryLabel(category))}</span>
    </li>`;
  });

  return html`
    <ul data-active-category="${selectedCategory}" class="category-list">
      ${categoryItems}
    </ul>
  `;
}

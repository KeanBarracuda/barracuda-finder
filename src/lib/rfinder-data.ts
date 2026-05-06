// Shared constants for rFinder (isomorphic — safe on client & server)

export const TOOL_VERSION = "Barracuda Finder";
export const DISCORD_URL = "https://discord.gg/yRtzFENhbt";

export const YEAR_ID_RANGES: Record<string, [number, number]> = {
  "Any year": [1, 9000000000],
  "2006": [1, 11386],
  "2007": [11387, 141897],
  "2008": [141898, 1892311],
  "2009": [1892312, 5881290],
  "2010": [5881291, 13901944],
  "2011": [13901945, 22797639],
  "2012": [22797640, 36347234],
  "2013": [36347235, 53530394],
  "2014": [53530395, 75524130],
  "2015": [75524131, 103531549],
  "2016": [103531550, 205441141],
  "2017": [205441142, 478149931],
  "2018": [478149932, 915267179],
  "2019": [915267180, 1390794501],
  "2020": [1390794502, 2259402999],
  "2021": [2259403000, 3193391431],
  "2022": [3193391432, 4195844718],
  "2023": [4195844712, 5402010909],
  "2024": [5402010910, 7794159194],
  "2025": [7794159195, 9000000000],
};

export const METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: "random", label: "Random — any username" },
  { value: "numberless", label: "Numberless — no digits" },
  { value: "numbers", label: "Numbers — has at least one digit" },
  { value: "ends_in_123", label: "Ends in 123" },
  { value: "ends_in_1_digit", label: "Ends in exactly 1 digit" },
  { value: "ends_in_2_digits", label: "Ends in exactly 2 digits" },
  { value: "ends_in_4_digits", label: "Ends in exactly 4 digits" },
  { value: "year", label: "Year (1970–2017)" },
  { value: "double", label: "Double — repeated chunk + digits" },
  { value: "real_name", label: "Real name + 2–4 digits / 123" },
  { value: "double_real_name", label: "Doubled real name (e.g. bennybenny)" },
  { value: "4digits_real_name", label: "Real name + exactly 4 digits" },
  { value: "nonstop", label: "Nonstop — continuous scan" },
];

export const SORT_OPTIONS = [
  "None",
  "Username A→Z",
  "Username Z→A",
  "ID low→high",
  "ID high→low",
  "Created oldest→newest",
  "Created newest→oldest",
  "RAP high→low",
  "RAP low→high",
  "Verified Yes first",
  "Verified No first",
  "Banned Yes first",
  "Banned No first",
  "Active Yes first",
  "Active No first",
];

export const BAN_FILTER_OPTIONS = ["All", "Only not banned", "Only banned"];
export const VERIFIED_FILTER_OPTIONS = ["All", "Only verified", "Only unverified"];
export const ACTIVE_FILTER_OPTIONS = ["All", "Only active", "Only inactive"];

export const RAP_PRESETS: Record<string, number | null> = {
  Off: null,
  "100+": 100,
  "500+": 500,
  "1k+": 1000,
  "2.5k+": 2500,
  "5k+": 5000,
  "10k+": 10000,
};

export const HAT_PRESETS: Record<string, number | null> = {
  Off: null,
  "1+": 1,
  "2+": 2,
  "5+": 5,
  "10+": 10,
};

export const BADGE_ICON_URLS: Record<string, string> = {
  "Combat Initiation": "https://images.rbxcdn.com/8d77254fc1e6d904fd3ded29dfca28cb.png",
  Warrior: "https://images.rbxcdn.com/0a010c31a8b482731114810590553be3.png",
  Bloxxer: "https://images.rbxcdn.com/139a7b3acfeb0b881b93a40134766048.png",
  "Official Model Maker": "https://images.rbxcdn.com/45710972c9c8d556805f8bee89389648.png",
  Bricksmith: "https://images.rbxcdn.com/49f3d30f5c16a1c25ea0f97ea8ef150e.png",
  Homestead: "https://images.rbxcdn.com/b66bc601e2256546c5dd6188fce7a8d1.png",
  Inviter: "https://images.rbxcdn.com/01044aca1d917eb20bfbdc5e25af1294.png",
  Ambassador: "https://images.rbxcdn.com/b853909efc7fdcf590363d01f5894f09.png",
  Friendship: "https://images.rbxcdn.com/5eb20917cf530583e2641c0e1f7ba95e.png",
  Veteran: "https://images.rbxcdn.com/b7e6cabb5a1600d813f5843f37181fa3.png",
  Administrator:
    "https://static.wikia.nocookie.net/roblox/images/d/d1/Administrator_Badge_2025.png/revision/latest/scale-to-width-down/45?cb=20250508073352",
  "Welcome To The Club": "https://images.rbxcdn.com/6c2a598114231066a386fa716ac099c4.png",
};

export const BADGE_NAMES = Object.keys(BADGE_ICON_URLS);

// FIRST_NAME_TOKENS — copied verbatim from the Python source (male + female + unisex).
export const FIRST_NAME_TOKENS = new Set<string>([
  // Male
  "aaron","abraham","adam","adrian","adriano","albert","alex","alexander","alfie","alfred",
  "alejandro","alonso","anderson","andres","angel","anton","armando","arthur","augusto",
  "austin","alan","barry","ben","benjamin","benny","benito","bradley","brandon","brian","bruce",
  "bruno","caleb","callum","cameron","caio","carlos","cesar","charles","chester","christian",
  "christopher","connor","cristian","daan","damian","daniel","danilo","darwin","danny","davi","david",
  "declan","dennis","dexter","diego","dirk","dominic","donald","douglas","dylan","eddy",
  "eduardo","edmund","edward","elijah","elliot","elliott","emmanuel","enrique","eric",
  "ernesto","esteban","ethan","eugene","evan","everton","fabian","felipe","fernando","filipe",
  "francis","francisco","frederick","freddy","fraser","gabriel","garrett","garry","gareth",
  "george","gonzalo","graham","gregory","grayson","guido","guillermo","guilherme","hamish",
  "harold","harry","harvey","hayden","hector","henrique","henry","howard","hugh","hugo",
  "ignacio","isaac","isaiah","ivan","jack","jackson","jacob","jaime","jamal","james","jared",
  "jason","javier","jelle","jenson","jeremiah","jeremy","jesper","jesus","joao","joaquin",
  "joel","joey","john","johnny","jimmy","johnathan","jonathan","jorge","jordan","jose",
  "jonas","joseph","josh","joshua","juan","julian","julio","justin","kaden","kauan","kees",
  "keith","kenneth","kenny","kevin","kelvin","kieran","kyle","kylan","larry","laurence",
  "lawrence","leandro","leo","leon","leonard","lewis","liam","logan","lorenzo","louis","luca",
  "luis","lucas","luciano","luke","lukey","luan","maarten","malcolm","manuel","marco",
  "marcus","mariano","mark","martin","mateo","mateus","matt","matthew","max","michael",
  "mikey","miguel","mitchell","monty","murilo","nathan","nick","nicholas","nicolas","niall",
  "nigel","noah","oliver","ollie","orlando","oscar","osvaldo","otavio","owen","parker",
  "patrick","paul","pedro","percival","philip","piers","preston","quinton","rafa","rafael",
  "ramon","raul","raymond","reinier","renato","reuben","ricardo","richard","ricky","robert",
  "rodrigo","ronald","ryan","salvador","sam","samuel","santiago","sebastian","sergio","seth",
  "simon","spencer","stanley","stephen","steven","stuart","sven","tanner","thiago","timmy",
  "terry","theodore","thomas","timothy","tobias","tomas","tommy","travis","trevor","tristan",
  "tyler","valentin","vicente","victor","vincent","vinicius","walter","wesley","weslley",
  "wilfred","will","william","wyatt","xander","xavier","zach","zachariah","zachary",
  // Female
  "abigail","adela","adriana","aisling","alejandra","alicia","alexandra","alexis","aline",
  "alyssa","amanda","amber","amelia","amelie","ana","anastasia","andrea","angelica",
  "angelina","ann","anita","anna","annabelle","ariana","ashley","aubrey","audrey","autumn",
  "ava","avery","barbara","baylee","beatrice","beatriz","bella","beth","bethany","bianca",
  "blair","brenda","brianna","bridget","brooke","bruna","camila","camilla","carla","carmen",
  "caroline","carolina","cassandra","catherine","cecilia","charlotte","chloe","claire",
  "clara","clarissa","colette","consuelo","courtney","cressida","daniela","danielle",
  "daphne","delilah","diana","dorothy","eduarda","eleanor","elena","elisa","eliza",
  "elisabeth","elizabeth","ella","elsie","emily","emma","erica","estelle","eva","faith",
  "fatima","felicia","fernanda","fiona","florence","freya","gabriella","genevieve","georgia",
  "giovanna","giselle","gloria","grace","hailey","hannah","harper","heather","helena","holly",
  "imogen","ines","ingrid","irene","isabel","isabella","isadora","isidora","isla","ivy",
  "jasmine","jemima","jennifer","jessica","jill","joanna","jocelyn","josephine","julia",
  "julie","kaitlyn","karina","kate","katherine","katrina","kayla","kaylee","kendall",
  "kendra","kristen","larissa","laura","lauren","leah","leticia","liliana","lillian","linda",
  "lisa","lola","lorena","lorelei","lucia","luciana","lucy","luana","luisa","lydia",
  "madeline","magdalena","madison","magnolia","maisie","maria","marcela","mariana","marie",
  "marissa","margaret","martina","mary","matilda","megan","melanie","melissa","michelle",
  "millie","miranda","monica","monserrat","nadia","naomi","natalia","natalie","nicole","nina",
  "nora","olivia","paige","paloma","paola","patricia","penelope","pilar","priscilla",
  "rachel","rafaela","rebecca","renata","rocio","rosa","rosalie","rosanna","roxanne",
  "sabrina","samantha","sarah","savannah","scarlett","selena","serena","sharon","silvia",
  "sofia","soledad","sophia","stella","stephanie","susan","tamara","tania","taylor","teresa",
  "thais","tiffany","theodora","theresa","valentina","valeria","valerie","vanessa",
  "veronica","victoria","violet","vitoria","wendy","ximena","yasmin","yasmine","yesenia",
  "zoey",
  // Unisex / modern
  "alex","ari","ash","ashton","bailey","billy","blake","bluey","casey","charlie","chris",
  "cris","dakota","dani","devon","drew","eden","eli","ellis","finley","frances","harley",
  "hayden","jamie","jay","jordan","justice","kai","kit","lalo","lennon","logan","marley",
  "micah","morgan","nico","parker","peyton","phoenix","quinn","reese","remington","robin",
  "ross","rory","rowan","riley","rubin","sam","sasha","sawyer","skyler","sterling","sydney",
  "toby","tyler","whitney",
]);

export type ScanResult = {
  user_id: number;
  username: string;
  display_name: string;
  created: string;
  rap: number;
  hat_count: number;
  verified: boolean;
  banned: boolean;
  active: boolean;
  avatar_url: string;
  roblox_badges: string[];
  rap_items: { name: string; assetId: number; rap: number }[];
};

export type ScanResponse = {
  results: ScanResult[];
  scanned: number;
  matched: number;
  elapsed_seconds: number;
};

export type LookupResponse =
  | {
      ok: true;
      user_id: number;
      username: string;
      display_name: string;
      created: string;
      rap: number;
      hat_count: number;
      verified: boolean;
      banned: boolean;
      active: boolean;
      avatar_url: string;
      roblox_badges: { name: string; icon_url: string }[];
      rap_items: { name: string; assetId: number; rap: number }[];
    }
  | { ok: false; error: string };

const Units = [
  "bytes",
  "kB",
  "MB",
  "GB",
  "TB",
  "PB",
];

const truncate = (value?: string, limit: number = 100, tail: string = "...") => {
  if (!value)
    return "";
  return value.length > limit
    ? value.substring(0, limit) + tail
    : value;
}

const fileSize = (bytes: number = 0, precision: number = 2) => {
  if (Number.isNaN(parseFloat(String(bytes))) || !isFinite(bytes))
    return "?";

  let unit = 0;
  while ( bytes >= 1024 ) {
    bytes /= 1024;
    unit++;
  }

  return `${bytes.toFixed(+precision)} ${Units[unit]}`;
}

const secondsToTimestamp = (seconds: number) => {
  let ret = new Date(seconds * 1000).toISOString().substr(11, 8);

  if (ret.startsWith("00")) {
    // strip hours if under one hour
    ret = ret.substr(3);
  }
  if (ret.startsWith("0")) {
    // for duration under a minute, leave one leading zero
    ret = ret.substr(1);
  }
  return ret;
}

const fileNameFromPath = (path: string) => {
  if (!!path === false)
    return "No File Name";
  return path.replace(/^.*[\\/]/, "");
}

const age = (dateString?: string, fromDateString?: string) => {
  if (!dateString)
    return 0;

  const birthdate = new Date(dateString);
  const fromDate = fromDateString ? new Date(fromDateString) : new Date();

  let age = fromDate.getFullYear() - birthdate.getFullYear();
  if (birthdate.getMonth() > fromDate.getMonth() ||
      (birthdate.getMonth() >= fromDate.getMonth() && birthdate.getDay() > fromDate.getDay())) {
    age -= 1;
  }

  return age;
}

const bitRate = (bitrate: number) => {
  const megabits = bitrate / 1000000;
  return `${megabits.toFixed(2)} megabits per second`;
}

const resolution = (height: number) => {
  if (height >= 240 && height < 480) {
    return "240p";
  } else if (height >= 480 && height < 720) {
    return "480p";
  } else if (height >= 720 && height < 1080) {
    return "720p";
  } else if (height >= 1080 && height < 2160) {
    return "1080p";
  } else if (height >= 2160) {
    return "4K";
  } else {
    return undefined;
  }
}

const TextUtils = {
  truncate,
  fileSize,
  secondsToTimestamp,
  fileNameFromPath,
  age,
  bitRate,
  resolution
}

export default TextUtils;

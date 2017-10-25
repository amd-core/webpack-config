let env: string = 'snapshot';

const isValidString = (value: string | undefined | null): boolean => {
  return value !== undefined && value !== null && value !== '';
}

process.argv.forEach((val: string) => {
  const arg: Array<string> = val.split('=');
  if (isValidString(arg[0]) && isValidString(arg[1]) && arg[0] === '--env') { env = arg[1]; }
});

const isProduction: boolean = env === 'production';

export { env, isProduction };

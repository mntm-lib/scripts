module.exports = () => {
  return {
    postcssPlugin: 'postcss-warnings',
    OnceExit(_, context) {
      context.result.messages = context.result.messages.filter((message) => {
        // Warnings from autoprefixer is generally false positive
        return (
          message.type !== 'warning' &&
          message.plugin !== 'autoprefixer'
        );
      });
    }
  };
};

module.exports.postcss = true;

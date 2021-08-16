const friendlySyntaxErrorLabel = 'Syntax error:';

const formatMessage = (raw) => {
  let message = raw;

  if (typeof message !== 'string') {
    message = message.message || `${message}`;
  }

  let lines = message.split('\n');

  lines = lines.filter((line) => !/Module [ A-z]+\(from/.test(line));
  lines = lines.map((line) => {
    const parsingError = /Line (\d+):(?:(\d+):)?\s*Parsing error: (.+)$/.exec(
      line
    );

    if (!parsingError) {
      return line;
    }
    const [, errorLine, errorColumn, errorMessage] = parsingError;

    return `${friendlySyntaxErrorLabel} ${errorMessage} (${errorLine}:${errorColumn})`;
  });

  message = lines.join('\n');
  message = message.replace(
    /SyntaxError\s+\((\d+):(\d+)\)\s*(.+?)\n/g,
    `${friendlySyntaxErrorLabel} $3 ($1:$2)\n`
  );
  message = message.replace(
    /^.*export '(.+?)' was not found in '(.+?)'.*$/gm,
    `Attempted import error: '$1' is not exported from '$2'.`
  );
  message = message.replace(
    /^.*export 'default' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
    `Attempted import error: '$2' does not contain a default export (imported as '$1').`
  );
  message = message.replace(
    /^.*export '(.+?)' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
    `Attempted import error: '$1' is not exported from '$3' (imported as '$2').`
  );
  lines = message.split('\n');

  if (lines.length > 2 && lines[1].trim() === '') {
    lines.splice(1, 1);
  }

  lines[0] = lines[0].replace(/^(.*) \d+:\d+-\d+$/, '$1');

  if (lines[1] && lines[1].indexOf('Module not found: ') === 0) {
    lines = [
      lines[0],
      lines[1].
        replace('Error: ', '').
        replace('Module not found: Cannot find file:', 'Cannot find file:')
    ];
  }

  message = lines.join('\n');

  // At ... ...:x:y
  message = message.replace(
    /^\s*at\s((?!webpack:).)*:\d+:\d+[\s)]*(\n|$)/gm,
    ''
  );

  // At <anonymous>
  message = message.replace(/^\s*at\s<anonymous>(\n|$)/gm, '');
  lines = message.split('\n');

  lines = lines.filter(
    (line, index, arr) =>
      index === 0 || line.trim() !== '' || line.trim() !== arr[index - 1].trim()
  );

  message = lines.join('\n');

  return message.trim();
};

module.exports = (json) => {
  const errors = new Set();
  const warnings = new Set();

  json.errors.forEach((err) => {
    errors.add(formatMessage(err));
  });

  json.warnings.forEach((warn) => {
    warnings.add(formatMessage(warn));
  });

  return {
    errors: Array.from(errors),
    warnings: Array.from(warnings)
  };
};

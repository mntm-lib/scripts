const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const resolve = require('resolve');

const paths = require('../../paths');

const base = new ForkTsCheckerWebpackPlugin({
  typescript: {
    enabled: true,
    build: false,
    mode: 'write-references',
    context: paths.appSrc,
    configFile: paths.appTsConfig,
    configOverwrite: {
      // @ts-expect-error wrong typing
      skipLibCheck: true,
      inlineSourceMap: false,
      declarationMap: false,
      noEmit: true,
      incremental: true,
      tsBuildInfoFile: paths.appTsBuildInfoFile
    },
    typescriptPath: resolve.sync('typescript', {
      basedir: paths.appNodeModules
    }),
    diagnosticOptions: {
      syntactic: true
    }
  },
  async: true,
  formatter: 'basic',
  logger: {
    infrastructure: 'silent'
  },
  issue: {
    include: [{
      file: '../**/src/**/*.{ts,tsx}'
    }, {
      file: '**/src/**/*.{ts,tsx}'
    }]
  }
});

class TypescriptCheckerPlugin {
  apply(compiler) {
    base.apply(compiler);

    const hooks = ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler);

    hooks.issues.tap('TypescriptCheckerPlugin', (issues) => {
      return issues.map((issue) => {
        issue.severity = 'warning';

        return issue;
      });
    });
  }
}

module.exports = TypescriptCheckerPlugin;

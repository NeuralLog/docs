"use strict";(self.webpackChunkneural_log_docs=self.webpackChunkneural_log_docs||[]).push([[5564],{6477:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>c,contentTitle:()=>l,default:()=>h,frontMatter:()=>t,metadata:()=>r,toc:()=>o});const r=JSON.parse('{"id":"development/shared-package","title":"Shared Package Management","description":"The @neurallog/shared package contains common types and utilities used across all NeuralLog components, including the server, web application, and SDK. This guide explains how to manage, publish, and consume the shared package.","source":"@site/docs/development/shared-package.md","sourceDirName":"development","slug":"/development/shared-package","permalink":"/docs/docs/development/shared-package","draft":false,"unlisted":false,"editUrl":"https://github.com/NeuralLog/docs/tree/main/docs/development/shared-package.md","tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_position":2}}');var s=a(4848),i=a(8453);const t={sidebar_position:2},l="Shared Package Management",c={},o=[{value:"Package Structure",id:"package-structure",level:2},{value:"Key Types",id:"key-types",level:2},{value:"LogLevel",id:"loglevel",level:3},{value:"LogEntry",id:"logentry",level:3},{value:"LogResponse",id:"logresponse",level:3},{value:"Building the Package",id:"building-the-package",level:2},{value:"Publishing to the Private Registry",id:"publishing-to-the-private-registry",level:2},{value:"1. Start the Verdaccio Container",id:"1-start-the-verdaccio-container",level:3},{value:"2. Configure npm to Use the Private Registry",id:"2-configure-npm-to-use-the-private-registry",level:3},{value:"3. Create a User in Verdaccio (if not already created)",id:"3-create-a-user-in-verdaccio-if-not-already-created",level:3},{value:"4. Publish the Package",id:"4-publish-the-package",level:3},{value:"5. Verify the Package is Published",id:"5-verify-the-package-is-published",level:3},{value:"Installing the Shared Package",id:"installing-the-shared-package",level:2},{value:"1. Configure npm to Use the Private Registry",id:"1-configure-npm-to-use-the-private-registry",level:3},{value:"2. Install the Package",id:"2-install-the-package",level:3},{value:"Using the Shared Package in Docker",id:"using-the-shared-package-in-docker",level:2},{value:"Updating the Shared Package",id:"updating-the-shared-package",level:2},{value:"Example Workflow",id:"example-workflow",level:3},{value:"Troubleshooting",id:"troubleshooting",level:2},{value:"Package Not Found",id:"package-not-found",level:3},{value:"TypeScript Errors",id:"typescript-errors",level:3},{value:"Docker Connection Issues",id:"docker-connection-issues",level:3}];function d(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"shared-package-management",children:"Shared Package Management"})}),"\n",(0,s.jsxs)(n.p,{children:["The ",(0,s.jsx)(n.code,{children:"@neurallog/shared"})," package contains common types and utilities used across all NeuralLog components, including the server, web application, and SDK. This guide explains how to manage, publish, and consume the shared package."]}),"\n",(0,s.jsx)(n.h2,{id:"package-structure",children:"Package Structure"}),"\n",(0,s.jsxs)(n.p,{children:["The shared package is located in the ",(0,s.jsx)(n.code,{children:"shared"})," directory and has the following structure:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"shared/\n\u251c\u2500\u2500 types/             # Type definitions\n\u2502   \u251c\u2500\u2500 index.ts       # Main entry point for types\n\u2502   \u2514\u2500\u2500 ...            # Other type files\n\u251c\u2500\u2500 dist/              # Compiled output\n\u251c\u2500\u2500 package.json       # Package configuration\n\u2514\u2500\u2500 tsconfig.json      # TypeScript configuration\n"})}),"\n",(0,s.jsx)(n.h2,{id:"key-types",children:"Key Types"}),"\n",(0,s.jsx)(n.p,{children:"The shared package includes several key types used throughout the NeuralLog system:"}),"\n",(0,s.jsx)(n.h3,{id:"loglevel",children:"LogLevel"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"/**\n * Log levels\n */\nexport enum LogLevel {\n  DEBUG = 'debug',\n  INFO = 'info',\n  WARN = 'warn',\n  ERROR = 'error',\n  FATAL = 'fatal'\n}\n"})}),"\n",(0,s.jsx)(n.h3,{id:"logentry",children:"LogEntry"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"/**\n * Log entry interface\n */\nexport interface LogEntry {\n  id: string;\n  timestamp: number;\n  data: Record<string, any>;\n}\n"})}),"\n",(0,s.jsx)(n.h3,{id:"logresponse",children:"LogResponse"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"/**\n * Log response interface\n */\nexport interface LogResponse {\n  status: string;\n  name: string;\n  namespace: string;\n  entries: LogEntry[];\n}\n"})}),"\n",(0,s.jsx)(n.h2,{id:"building-the-package",children:"Building the Package"}),"\n",(0,s.jsx)(n.p,{children:"Before publishing, you need to build the package:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-powershell",children:"cd shared\nnpm run build\n"})}),"\n",(0,s.jsxs)(n.p,{children:["This will compile the TypeScript code and generate the distribution files in the ",(0,s.jsx)(n.code,{children:"dist"})," directory."]}),"\n",(0,s.jsx)(n.h2,{id:"publishing-to-the-private-registry",children:"Publishing to the Private Registry"}),"\n",(0,s.jsx)(n.p,{children:"NeuralLog uses Verdaccio as a private npm registry for sharing packages between components. To publish the shared package:"}),"\n",(0,s.jsx)(n.h3,{id:"1-start-the-verdaccio-container",children:"1. Start the Verdaccio Container"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-powershell",children:"docker-compose -f docker-compose.web.yml up -d verdaccio\n"})}),"\n",(0,s.jsx)(n.h3,{id:"2-configure-npm-to-use-the-private-registry",children:"2. Configure npm to Use the Private Registry"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-powershell",children:"npm config set @neurallog:registry http://localhost:4873\n"})}),"\n",(0,s.jsx)(n.h3,{id:"3-create-a-user-in-verdaccio-if-not-already-created",children:"3. Create a User in Verdaccio (if not already created)"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-powershell",children:"# Use username: admin, password: admin\nnpm adduser --registry http://localhost:4873 --auth-type=legacy\n"})}),"\n",(0,s.jsx)(n.h3,{id:"4-publish-the-package",children:"4. Publish the Package"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-powershell",children:"cd shared\nnpm publish --registry http://localhost:4873\n"})}),"\n",(0,s.jsx)(n.h3,{id:"5-verify-the-package-is-published",children:"5. Verify the Package is Published"}),"\n",(0,s.jsxs)(n.p,{children:["You can check if the package is published by visiting the Verdaccio web interface at ",(0,s.jsx)(n.a,{href:"http://localhost:4873",children:"http://localhost:4873"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"installing-the-shared-package",children:"Installing the Shared Package"}),"\n",(0,s.jsx)(n.p,{children:"To install the shared package in another component:"}),"\n",(0,s.jsx)(n.h3,{id:"1-configure-npm-to-use-the-private-registry",children:"1. Configure npm to Use the Private Registry"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-powershell",children:"npm config set @neurallog:registry http://localhost:4873\n"})}),"\n",(0,s.jsx)(n.h3,{id:"2-install-the-package",children:"2. Install the Package"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-powershell",children:"npm install @neurallog/shared --registry http://localhost:4873\n"})}),"\n",(0,s.jsx)(n.h2,{id:"using-the-shared-package-in-docker",children:"Using the Shared Package in Docker"}),"\n",(0,s.jsx)(n.p,{children:"When using the shared package in a Docker container, you need to configure npm to use the private registry:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-dockerfile",children:"# Configure npm to use the private registry\nRUN npm config set @neurallog:registry http://verdaccio:4873\n\n# Install dependencies\nRUN npm install\n"})}),"\n",(0,s.jsx)(n.p,{children:"In Docker Compose, you can use the following command:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:'command: sh -c "npm config set registry http://verdaccio:4873 ; npm install ; npm run build ; npm start"\n'})}),"\n",(0,s.jsx)(n.h2,{id:"updating-the-shared-package",children:"Updating the Shared Package"}),"\n",(0,s.jsx)(n.p,{children:"When you make changes to the shared package, you need to:"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["Update the version number in ",(0,s.jsx)(n.code,{children:"package.json"})]}),"\n",(0,s.jsx)(n.li,{children:"Build the package"}),"\n",(0,s.jsx)(n.li,{children:"Publish the new version"}),"\n",(0,s.jsx)(n.li,{children:"Update the package in all components that use it"}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"example-workflow",children:"Example Workflow"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-powershell",children:"# Make changes to the shared package\ncd shared\n\n# Update the version number in package.json\n# (Edit the file manually or use npm version)\nnpm version patch\n\n# Build the package\nnpm run build\n\n# Publish the new version\nnpm publish --registry http://localhost:4873\n\n# Update the package in other components\ncd ../server\nnpm install @neurallog/shared@latest --registry http://localhost:4873\n\ncd ../web\nnpm install @neurallog/shared@latest --registry http://localhost:4873\n\ncd ../auth\nnpm install @neurallog/shared@latest --registry http://localhost:4873\n\ncd ../typescript\nnpm install @neurallog/shared@latest --registry http://localhost:4873\n"})}),"\n",(0,s.jsx)(n.h2,{id:"troubleshooting",children:"Troubleshooting"}),"\n",(0,s.jsx)(n.h3,{id:"package-not-found",children:"Package Not Found"}),"\n",(0,s.jsx)(n.p,{children:"If you get an error that the package cannot be found, make sure:"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsx)(n.li,{children:"Verdaccio is running"}),"\n",(0,s.jsx)(n.li,{children:"You've published the package to Verdaccio"}),"\n",(0,s.jsx)(n.li,{children:"npm is configured to use the private registry for the @neurallog scope"}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"typescript-errors",children:"TypeScript Errors"}),"\n",(0,s.jsx)(n.p,{children:"If you get TypeScript errors about missing types, make sure:"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsx)(n.li,{children:"The package is built correctly"}),"\n",(0,s.jsx)(n.li,{children:"The package is installed correctly"}),"\n",(0,s.jsxs)(n.li,{children:["The ",(0,s.jsx)(n.code,{children:"tsconfig.json"})," file in the consuming project is configured to use the types"]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"docker-connection-issues",children:"Docker Connection Issues"}),"\n",(0,s.jsx)(n.p,{children:"If Docker containers can't connect to Verdaccio, make sure:"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsx)(n.li,{children:"All containers are on the same network"}),"\n",(0,s.jsxs)(n.li,{children:["You're using the correct hostname (",(0,s.jsx)(n.code,{children:"verdaccio"})," inside Docker, ",(0,s.jsx)(n.code,{children:"localhost"})," outside Docker)"]}),"\n",(0,s.jsx)(n.li,{children:"The Verdaccio container is running"}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},8453:(e,n,a)=>{a.d(n,{R:()=>t,x:()=>l});var r=a(6540);const s={},i=r.createContext(s);function t(e){const n=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:t(e.components),r.createElement(i.Provider,{value:n},e.children)}}}]);
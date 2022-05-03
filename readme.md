## Magnolia headless project + nextjs

This poc uses latest magnolia version with the new feature for headless accelerator into a nextjs conversion

Useful documentation: 

- https://ha.magnolia-cms.com/docs/getting-started/installation
- https://hd.magnolia-cms.com/docs/getting-started/hello-spa/
- https://docs.magnolia-cms.com/magnolia-cli/4.x/index.html

### Guideline to start the project

> Important note: The project does not work with yarn as a package manager

Steps to run:

- Start magnolia:

`mvn clean package`

- start tomcat 9 with these options/ env
`
magnoliaInstance=localAuthor
-Dfile.encoding=utf-8 -XX:PermSize=128m -XX:MaxPermSize=256m -Xms512m -Xmx1024m -Dmagnolia.resources.dir=/<location>/magnolia-cms-nextjs/light_modules
`
- Configure endpoints/perms:
  After setting the project from scratch and all modules loaded I set up this perms for the anonymous role. security > roles > web access:
`
/.rest/*
Deny
/.rest/delivery/*
Allow (Get)
/.rest/template-annotations/v1*
Allow (Get)
/.rest/template-definitions/v1*
Allow (Get)
`
- Import demo project
frontdev/_dev/content-to-import/website.nextjs-ssr-minimal.yaml

- Start frontend:

Then, while this is running I start the server for nextJs:

`
cd frontdev/nextjs-ssr-minimal
npm i
npm run build && npm start
`
Using yarn seems to not show green bars:
`
yarn
run dev
`

It will be available at localhost:3000

- Edit SSR

### Guideline for lightdev

Config your mgnl CLI interface with the following:

> npm i -g @magnolia/cli
> mgnl help
> mgnl tab-completion install

Then proceed to the lightdev folder and execute the following
> mkdir sandbox
> cd sandbox
> mgnl create-light-module 
> mgnl create-page sandbox-landing

This generates the needed dialogs and files

### Guideline for nextjs

- Under frontdev/nextjs-ssg-minimal there is a NextJS project that will be embedded into magnolia author
- We need to setup valid perms for the anonymous rol as shown in frontdev/_dev/anonymous-rol-perms.png

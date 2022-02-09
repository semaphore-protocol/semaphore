import { useColorMode } from "@docusaurus/theme-common"
import Link from "@docusaurus/Link"
import styled from "@emotion/styled"
import Layout from "@theme/Layout"
import React from "react"

export const semaphoreComponents = [
  {
    title: "semaphore-circuits",
    href: "https://github.com/appliedzkp/semaphore/tree/main/circuits"
  },
  {
    title: "semaphore-contracts",
    href: "https://github.com/appliedzkp/semaphore/tree/main/contracts"
  },
  {
    title: "@zk-kit/identity",
    href: "https://github.com/appliedzkp/zk-kit/tree/main/packages/identity"
  },
  {
    title: "@zk-kit/protocols",
    href: "https://github.com/appliedzkp/zk-kit/tree/main/packages/protocols"
  }
]

export const pseProjects = [
  {
    title: "ZK-kit",
    text: "A monorepo of reusable JS libraries for zero-knowledge technologies.",
    to: "https://github.com/appliedzkp/zk-kit"
  },
  {
    title: "InterRep",
    text: "A system that allows DApps or services to verify users' reputation without exposing their identities.",
    to: "https://github.com/InterRep/"
  }
]

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  margin-bottom: 4rem;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 16px;
  justify-content: center;
  margin: 0 auto;
  padding: 1rem 0;
  max-width: 960px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    max-width: 100%;
    margin: 0 1rem;
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const TwoRow = styled(Row)`
  grid-template-columns: 1fr 1fr;
  grid-gap: 48px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const ButtonGroup = styled.div`
  display: flex;
`

const Button = styled.div`
  padding: 0.6rem 1rem;
  margin: 0 0.3rem;
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid var(--ifm-color-emphasis-200);

  &:hover {
    border: 1px solid var(--ifm-color-emphasis-400);
  }
`

const Card = styled.div`
  display: flex;
  max-height: 250px;
  min-width: 350px;
  padding: 1.1rem;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-bottom: 1px solid var(--ifm-color-emphasis-200);
  /* flex: 1 1 0px; */

  &:hover {
    border-bottom: 1px solid var(--ifm-color-emphasis-400);
  }

  @media (max-width: 960px) {
    width: 100%;
  }
`

const LinkRow = styled.div`
  width: 100%;
  align-items: center;
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  a h3 {
    color: black !important;
  }
`

const DocsHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
  position: relative;
`

const StyledGithubIcon = styled.div`
  svg {
    fill: var(--ifm-font-color-base);
  }
`

export default function Home() {
  return (
    <Layout title={`Semaphore Docs`} description="Technical Documentation For The Semaphore Protocol.">
      <Container>
        <DocsHeader>
          <div
            style={{
              padding: "4rem 0  ",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <h1 style={{ margin: "20px", fontSize: "36px" }}> Semaphore</h1>

            <p
              style={{
                maxWidth: "700px",
                fontSize: "20px"
              }}
            >
              A privacy gadget for creating anonymous proof of membership on Ethereum.
            </p>

            <ButtonGroup>
              <Link style={{ textDecoration: "none" }} href="/docs/introduction">
                <Button>Get Started</Button>
              </Link>
              <Link style={{ textDecoration: "none" }} href="/docs/usage">
                <Button>Usage</Button>
              </Link>
              <Link style={{ textDecoration: "none" }} href="/docs/contributing">
                <Button>Contribute</Button>
              </Link>
            </ButtonGroup>
          </div>
        </DocsHeader>
        <hr />
        <TwoRow
          style={{
            gap: "56px",
            marginTop: "4rem"
          }}
        >
          <div>
            <h2>Developer Links</h2>
            <p>Learn more about the code of the various Semaphore components.</p>
            {semaphoreComponents.map((action) => (
              <Link style={{ textDecoration: "none" }} href={action.href}>
                <Card key={action.title} style={{ marginBottom: "1rem" }}>
                  <LinkRow>
                    <StyledGithubIcon style={{ display: "flex", alignItems: "center" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120.78 117.79" style={{ width: "24px" }}>
                        <defs></defs>
                        <title>Github</title>
                        <g id="Layer_2" data-name="Layer 2">
                          <g id="Layer_1-2" data-name="Layer 1">
                            <path d="M60.39,0A60.39,60.39,0,0,0,41.3,117.69c3,.56,4.12-1.31,4.12-2.91,0-1.44-.05-6.19-.08-11.24C28.54,107.19,25,96.42,25,96.42c-2.75-7-6.71-8.84-6.71-8.84-5.48-3.75.41-3.67.41-3.67,6.07.43,9.26,6.22,9.26,6.22,5.39,9.23,14.13,6.57,17.57,5,.55-3.9,2.11-6.56,3.84-8.07C36,85.55,21.85,80.37,21.85,57.23A23.35,23.35,0,0,1,28.08,41c-.63-1.52-2.7-7.66.58-16,0,0,5.07-1.62,16.61,6.19a57.36,57.36,0,0,1,30.25,0C87,23.42,92.11,25,92.11,25c3.28,8.32,1.22,14.46.59,16a23.34,23.34,0,0,1,6.21,16.21c0,23.2-14.12,28.3-27.57,29.8,2.16,1.87,4.09,5.55,4.09,11.18,0,8.08-.06,14.59-.06,16.57,0,1.61,1.08,3.49,4.14,2.9A60.39,60.39,0,0,0,60.39,0Z" />
                            <path d="M22.87,86.7c-.13.3-.6.39-1,.19s-.69-.61-.55-.91.61-.39,1-.19.69.61.54.91Z" />
                            <path d="M25.32,89.43c-.29.27-.85.14-1.24-.28a.92.92,0,0,1-.17-1.25c.3-.27.84-.14,1.24.28s.47,1,.17,1.25Z" />
                            <path d="M27.7,92.91c-.37.26-1,0-1.35-.52s-.37-1.18,0-1.44,1,0,1.35.51.37,1.19,0,1.45Z" />
                            <path d="M31,96.27A1.13,1.13,0,0,1,29.41,96c-.53-.49-.68-1.18-.34-1.54s1-.27,1.56.23.68,1.18.33,1.54Z" />
                            <path d="M35.46,98.22c-.15.47-.82.69-1.51.49s-1.13-.76-1-1.24.82-.7,1.51-.49,1.13.76,1,1.24Z" />
                            <path d="M40.4,98.58c0,.5-.56.91-1.28.92s-1.3-.38-1.31-.88.56-.91,1.29-.92,1.3.39,1.3.88Z" />
                            <path d="M45,97.8c.09.49-.41,1-1.12,1.12s-1.35-.17-1.44-.66.42-1,1.12-1.12,1.35.17,1.44.66Z" />
                          </g>
                        </g>
                      </svg>
                      <h3 style={{ marginBottom: "0rem", marginLeft: "16px" }}>{action.title}</h3>
                    </StyledGithubIcon>
                  </LinkRow>
                </Card>
              </Link>
            ))}
          </div>
          <div>
            <h2>Privacy and Scaling Explorations</h2>
            <p>Discover other interesting projects of our team.</p>
            <div>
              {pseProjects.map((action) => (
                <Link style={{ textDecoration: "none" }} key={action.title} to={action.to}>
                  <Card key={action.title} style={{ marginBottom: "1rem" }}>
                    <LinkRow>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <h3 style={{ marginBottom: "0rem" }}>{action.title}</h3>
                      </div>
                    </LinkRow>
                    <p style={{ marginBottom: "0rem" }}>{action.text}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </TwoRow>
      </Container>
    </Layout>
  )
}

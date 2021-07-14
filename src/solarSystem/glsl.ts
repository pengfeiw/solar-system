// 太阳顶点着色器
export const vertex_source_sun =
    `#version 300 es
    in vec3 aPos;
    in vec2 aTexCoord;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    out vec2 v_texCoord;

    void main() {
        gl_Position = projection * view * model * vec4(aPos, 1.0);
        v_texCoord = aTexCoord;
    }
`;

// 太阳片段着色器
export const fragment_source_sun =
    `#version 300 es
    precision highp float;

    out vec4 FragColor;

    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    
    // uniform vec3 color;
    
    void main() {
        // FragColor = vec4(color, 1.0);
        FragColor = texture(u_texture, v_texCoord);
    }
`;

// 行星顶点着色器
export const vertex_source =
    `#version 300 es
    in vec3 aPos;
    in vec3 aNorm; // 法向量
    in vec2 aTexCoord;

    out vec3 FragPos;
    out vec3 normal;
    out vec2 v_texCoord;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    void main() {
        gl_Position = projection * view * model * vec4(aPos, 1.0);
        vec4 fragPos = model * vec4(aPos, 1.0);
        FragPos = vec3(fragPos.xyz);

        normal = mat3(transpose(inverse(model))) * aNorm; // 法线矩阵为模型矩阵左上角子矩阵的逆矩阵的转置矩阵

        v_texCoord = aTexCoord;
    }
`;

// 行星片段着色器
export const fragment_source =
    `#version 300 es
    precision highp float;

    out vec4 FragColor;

    in vec3 FragPos;
    in vec3 normal;
    in vec2 v_texCoord;

    uniform vec3 sunLightColor; // 太阳光照颜色
    uniform sampler2D u_texture;
    uniform vec3 sunPos; // 太阳位置
    float ambientStrength = 0.1; // 环境因子

    void main() {
        // 环境光
        vec3 ambient = ambientStrength * sunLightColor;
        
        // 漫反射光
        vec3 lightDirReverse = FragPos - sunPos;
        vec3 n_lightDirReverse = normalize(lightDirReverse);
        vec3 n_norm = normalize(normal);
        float diffuseStrength = max(dot(n_norm, n_lightDirReverse), 0.0); // 漫反射因子
        vec3 diffuse = diffuseStrength * sunLightColor;

        vec3 color = texture(u_texture, v_texCoord).rgb;

        vec3 result = color * (ambient + diffuse);
        FragColor = vec4(result, 1.0);
    }
`;

// 公转线顶点着色器
export const vertex_source_line =
    `#version 300 es
    in vec3 aPos;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    void main() {
        gl_Position = projection * view * model * vec4(aPos, 1.0);
    }
`;

// 公转线片段着色器
export const fragment_source_line =
    `#version 300 es
    precision highp float;

    out vec4 FragColor;

    void main() {
        FragColor = vec4(0.13, 0.14, 0.17, 1.0);
    }
`;

// 背景星空顶点着色器
export const vertex_source_background =
    `#version 300 es
    
    in vec3 aPos;
    in vec2 aTexCoord;

    out vec2 v_texCoord;

    void main() {
        gl_Position = vec4(aPos, 1.0);
        v_texCoord = aTexCoord;
    }
`;

// 背景星空片段着色器
export const fragment_source_background =
    `#version 300 es
    precision highp float;

    out vec4 FragColor;

    in vec2 v_texCoord;

    uniform sampler2D u_texture;

    void main() {
        FragColor = texture(u_texture, v_texCoord);
    }
`;

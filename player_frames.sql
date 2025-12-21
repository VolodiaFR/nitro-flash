/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 110802 (11.8.2-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : hobbu

 Target Server Type    : MySQL
 Target Server Version : 110802 (11.8.2-MariaDB)
 File Encoding         : 65001

 Date: 21/12/2025 04:42:02
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for player_frames
-- ----------------------------
DROP TABLE IF EXISTS `player_frames`;
CREATE TABLE `player_frames`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NULL DEFAULT NULL,
  `frame_name` varchar(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT '',
  `active` enum('0','1') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `player_id_badge_code`(`player_id` ASC, `frame_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 242 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of player_frames
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;

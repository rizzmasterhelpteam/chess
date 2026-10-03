package com.grandmaster.chess.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Extension
import androidx.compose.material.icons.filled.SportsKabaddi
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.*
import com.grandmaster.chess.ui.features.bots.BotGameScreen
import com.grandmaster.chess.ui.features.learn.LearnScreen
import com.grandmaster.chess.ui.features.puzzles.PuzzlesScreen

sealed class Screen(val route: String, val title: String) {
    object Learn : Screen("learn", "Learn")
    object Puzzles : Screen("puzzles", "Puzzles")
    object Play : Screen("play", "Play")
}

@Composable
fun AppNavigation(navController: NavHostController) {
    var selectedItem by remember { mutableStateOf(0) }
    val items = listOf(Screen.Learn, Screen.Puzzles, Screen.Play)

    Scaffold(
        bottomBar = {
            NavigationBar {
                items.forEachIndexed { index, screen ->
                    NavigationBarItem(
                        icon = {
                            when (screen) {
                                Screen.Learn -> Icon(Icons.Default.Book, contentDescription = "Learn")
                                Screen.Puzzles -> Icon(Icons.Default.Extension, contentDescription = "Puzzles")
                                Screen.Play -> Icon(Icons.Default.SportsKabaddi, contentDescription = "Play")
                            }
                        },
                        label = { Text(screen.title) },
                        selected = selectedItem == index,
                        onClick = {
                            selectedItem = index
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.startDestinationId) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Learn.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Learn.route) {
                LearnScreen(onNavigateToPuzzles = {
                    selectedItem = 1
                    navController.navigate(Screen.Puzzles.route)
                })
            }
            composable(Screen.Puzzles.route) {
                PuzzlesScreen()
            }
            composable(Screen.Play.route) {
                BotGameScreen()
            }
        }
    }
}
